# build environment
FROM node:16-alpine3.18 as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install
COPY . ./
ENV NODE_ENV production
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/public/js/dist/* /validator/
COPY nginx/nginx.conf /nginx.conf.template
COPY nginx/entrypoint.sh /entrypoint.sh
COPY create_config.sh /create_config.sh
ENV validator_base_path '/'
EXPOSE 80
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]
