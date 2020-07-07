# build environment
FROM node:13.12.0-alpine as build
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
COPY --from=build /app/public/js/dist/* /usr/share/nginx/html/
COPY --from=build /app/public/data/profiles.json /usr/share/nginx/html/data/profiles.json
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
