import React, {
  useReducer,
  useEffect,
  FormEvent,
  createContext,
  ReactElement,
  Dispatch,
} from 'react';
import { useHistory } from 'react-router-dom';
import { ValueType as ValuesType, OptionTypeBase } from 'react-select';
import ReactGA from 'react-ga4';

import { validateWith, addProfile } from 'models/HL7Validator';
import { SelectOption } from 'models/SelectOption';
import { ErrorAlert } from './ErrorAlert';
import { ResourceCard } from './ResourceCard';
import { AdvancedOptionsCard } from './AdvancedOptionsCard';
import {
  State as FormInputItemState,
  Action as FormInputItemAction,
  reducer as formInputItemReducer,
  initialState as initialFormInputItemState,
} from './FormInputItem';
import { AppState } from './App';
import { RESULTS_PATH } from './Results';

type KeysWithValue<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];

type ValueType<OptionType extends OptionTypeBase> = Exclude<
  ValuesType<OptionType, false>,
  ReadonlyArray<OptionType>
>;

export interface FormState {
  resource: FormInputItemState;
  profile: FormInputItemState;
  implementationGuide: ValueType<SelectOption>;
  profileSelect: ValuesType<SelectOption, false>;
  error: string;
  tab: 'ig' | 'standalone';
}

type FormAction =
  | ({ name: KeysWithValue<FormState, FormInputItemState> } & FormInputItemAction)
  | { name: 'implementationGuide'; value: FormState['implementationGuide'] }
  | { name: 'profileSelect'; value: FormState['profileSelect'] }
  | { name: 'SET_ERROR'; error: FormState['error'] }
  | { name: 'SET_TAB'; value: FormState['tab'] }
  | { name: 'RESET' };

const initialFormState: FormState = {
  resource: initialFormInputItemState,
  profile: initialFormInputItemState,
  implementationGuide: null,
  profileSelect: null,
  error: '',
  tab: 'ig',
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  let newState = { ...state };
  switch (action.name) {
    case 'resource':
    case 'profile':
      newState[action.name] = formInputItemReducer(state[action.name], action);
      break;
    case 'implementationGuide':
      newState[action.name] = action.value || null;
      // keep profileSelect value in sync with the selected implementationGuide
      newState.profileSelect = null;
      break;
    case 'profileSelect':
      newState[action.name] = action.value;
      break;
    case 'SET_ERROR':
      newState.error = action.error;
      break;
    case 'SET_TAB':
      newState.tab = action.value;
      break;
    case 'RESET':
      newState = initialFormState;
      break;
  }
  return newState;
};

export const FormContext = createContext<[FormState, Dispatch<FormAction>]>([
  initialFormState,
  (): void => void 0,
]);

export function ValidatorForm(): ReactElement {
  const history = useHistory<AppState>();
  const [formState, dispatch] = useReducer(formReducer, history.location.state || initialFormState);

  // Delete history state on page refresh
  useEffect(() => {
    const deleteHistoryState = (): void => history.replace(history.location.pathname);
    window.addEventListener('beforeunload', deleteHistoryState);
    return (): void => window.removeEventListener('beforeunload', deleteHistoryState);
  }, [history]);

  const {
    resource: { text: resourceBlob, error: resourceError },
    profile: { text: profileBlob, error: profileError },
    profileSelect,
    error,
    tab,
  } = formState;

  const disableSubmit =
    !resourceBlob || !!resourceError || (tab === 'standalone' && !!profileError);

  const handleError = (error: string): void => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    dispatch({ name: 'SET_ERROR', error });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (disableSubmit) {
      return handleError('Failed to submit form: Resource is invalid');
    }

    const empty: ValueType<SelectOption>[] = [];
    const profileUrls = empty
      .concat(profileSelect)
      .flatMap((option) => (option == null ? [] : [option.value]));

    try {
      if (profileBlob.trim()) {
        const profileUrl = await addProfile(profileBlob);
        profileUrls.push(profileUrl);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        return handleError(`Failed to upload profile: ${error?.message}`);
      }
    }

    try {
      const results = await validateWith(profileUrls, resourceBlob);
      history.replace(history.location.pathname, formState);
      history.push(RESULTS_PATH, { ...formState, results });
      sendValidateClick();
    } catch (error: unknown) {
      if (error instanceof Error) {
        return handleError(`Failed to validate resource: ${error?.message}`);
      }
    }
  };

  const sendValidateClick = (): void => {
    if (window.location.hostname === 'inferno.healthit.gov') {
      ReactGA.event({
        category: 'form_submit',
        action: 'Validate',
      });
    }
  };

  return (
    <FormContext.Provider value={[formState, dispatch]}>
      {error && (
        <ErrorAlert
          error={error}
          onClose={(): void => dispatch({ name: 'SET_ERROR', error: '' })}
        />
      )}
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form aria-label="validator form" onSubmit={handleSubmit}>
        <ResourceCard />
        <br />
        <AdvancedOptionsCard />
        <br />
        <div className="form-group">
          <input
            type="submit"
            value="Validate"
            className="btn btn-primary"
            disabled={disableSubmit}
          />
          <input
            type="button"
            value="Reset"
            className="btn btn-primary ml-3"
            onClick={(): void => dispatch({ name: 'RESET' })}
          />
        </div>
      </form>
    </FormContext.Provider>
  );
}
