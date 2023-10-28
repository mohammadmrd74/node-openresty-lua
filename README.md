# Node js with OpenResty as gateway (and lua)

Please follow each step to run the project

I've user **sqlite database** for this project.

## OpenResty

- Install OpenResty
- ```sudo mkdir /usr/local/openresty/nginx/sites```
- ```sudo mkdir /var/log/openresty```
- ```sudo cp openResty/nginx.conf /usr/local/openresty/nginx/conf/```
- ```sudo cp openResty/server.conf /usr/local/openresty/nginx/sites/```

> Note: All the minify logs will be save in `/var/log/openresty/minify.log`.

## Project setup
```
yarn install
```

## Run
```
node server.js
```
> Note: postman collection is in ```/postman/nodeOpenResty.postman_collection.json```.

## Test
```
npm run test
```

I've also include webp convertion and some endpoint test cases for user