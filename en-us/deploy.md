
## Preamble
We strongly recommend that you keep your dev env and online env paths (*i.e. webpack's publicPath*) consistent to avoid problems after deployment, whether it's the base app or a sub-app

For example, an application that is deployed in the folder `my-app` of the server root directory is configured as follows：
<!-- tabs:start -->
#### **webpack**

```js
// webpack.config.js
module.exports = {
  output: {
    path: 'my-app',
    publicPath: process.env.NODE_ENV === 'production' ? '/my-app/' : '', // bad ❌
    publicPath: '/my-app/', // good 👍
  }
}
```

#### **vue-cli**
```js
// vue.config.js
module.exports = {
  outputDir: 'my-app',
  publicPath: process.env.NODE_ENV === 'production' ? '/my-app/' : '', // bad ❌
  publicPath: '/my-app/', // good 👍
}
```
<!-- tabs:end -->

## Typical example
Normally as long as the dev env and the online env resource path is the same, and is set up the nginx cross-domain after deployment, the project runs normally in the dev env and theoretically can also run normally after deployment.

However, in the actual development often appear 404 addresses, resource loss and other issues, which is usually due to server configuration errors or micro-app element url attribute address error.

We provide [micro-app-demo](https://github.com/micro-zoe/micro-app-demo) as an example to introduce deployment-related content for your reference. `micro-app-demo` covers history routing, hash routing, ssr, root path, secondary paths and most other scenarios that are typical cases.

#### Repo directory structure：
```
.
├── child_apps
│   ├── angular11        // Sub-app angular11 (history routing)
│   ├── nextjs11         // Sub-app nextjs11 (history routing)
│   ├── nuxtjs2          // Sub-app nuxtjs2 (history routing) 
│   ├── react16          // Sub-app react16 (history routing)
│   ├── react17          // Sub-app react17 (hash routing)
│   ├── sidebar          // Sub-app sidebar, public sidebar
│   ├── vite-vue3        // Sub-app vite (hash routing)
│   ├── vue2             // Sub-app vue2 (history routing)
│   └── vue3             // Sub-app vue3 (history routing)
├── main_apps
│   ├── angular11        // Base app angular11 (history routing)
│   ├── nextjs11         // Base app nextjs11 (history routing)
│   ├── nuxtjs2          // Base app nuxtjs2 (history routing)
│   ├── react16          // Base app react16 (history routing)
│   ├── react17          // Base app react17 (history routing)
│   ├── vite-vue3        // Base app vite (history routing)
│   ├── vue2             // Base app vue2 (history routing)
│   └── vue3             // Base app vue3 (history routing)
├── package.json
└── yarn.lock
```

#### Directory structure for deployment to the server：

```
root(Server root directory)
├── child
│   ├── angular11         // Sub-app angular11
│   ├── react16           // Sub-app react16
│   ├── react17           // Sub-app react17
│   ├── sidebar           // Sub-app sidebar
│   ├── vite              // Sub-app vite
│   ├── vue2              // Sub-app vue2
│   ├── vue3              // Sub-app vue3
│   ├── nextjs11          // Sub-app nextjs11，packaged separately for each docker app，Port：5001~5009
│   └── nuxtjs2           // Sub-app nuxtjs2，packaged separately for each docker app，Port：6001~6009
│ 
├── main-angular11        // Base app angular11
├── main-react16          // Base app react16
├── main-react17          // Base app react17
├── main-vite             // Base app vite
├── main-vue2             // Base app vue2
├── main-vue3             // Base app vue3
├── main-nextjs11         // Base app nextjs11，Port：5000
├── main-nuxtjs2          // Base app nuxtjs2，Port：7000
```

#### The nginx config is as follows：

The following configs are for reference only, specific items should be adjusted according to the actual situation.
```js
# micro-zoe.com Config
server {
  listen       80;
  server_name  www.micro-zoe.com micro-zoe.com;

  location / {
    root /root/mygit/micro-zoe;
    index index.php index.html index.htm;
    # add_header Cache-Control;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
  }

  # Base app main-angular11
  location /main-angular11 {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /main-angular11/index.html;
  }

  # Base app main-react16
  location /main-react16 {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /main-react16/index.html;
  }

  # Base app main-react17
  location /main-react17 {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /main-react17/index.html;
  }

  # Base app main-vite
  location /main-vite {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /main-vite/index.html;
  }

  # Base app main-vue2
  location /main-vue2 {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /main-vue2/index.html;
  }

  # Base app main-vue3
  location /main-vue3 {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /main-vue3/index.html;
  }

  # Sub-app child-angular11
  location /child/angular11 {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /child/angular11/index.html;
  }

  # Sub-app child-react16
  location /child/react16 {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /child/react16/index.html;
  }

  # Sub-app child-react17
  location /child/react17 {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /child/react17/index.html;
  }
  
  # Sub-app child-sidebar
  location /child/sidebar {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /child/sidebar/index.html;
  }

  # Sub-app child-vite
  location /child/vite {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /child/vite/index.html;
  }

  # Sub-app child-vue2
  location /child/vue2 {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /child/vue2/index.html;
  }

  # Sub-app child-vue3
  location /child/vue3 {
    root /root/mygit/micro-zoe;
    add_header Access-Control-Allow-Origin *;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
      add_header Cache-Control max-age=7776000;
      add_header Access-Control-Allow-Origin *;
    }
    try_files $uri $uri/ /child/vue3/index.html;
  }
  
  error_page 404 /404.html;
      location = /40x.html {
  }

  error_page 500 502 503 504 /50x.html;
      location = /50x.html {
  }
}

# After the base app nextjs11 is deployed and listening on port 5000, set the proxy to port 5000, then you can access the base app via nextjs11.micro-zoe.com
server {
  listen       80;
  server_name  nextjs11.micro-zoe.com;

  root html;
  index index.html index.htm;

  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host:80;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # add_header Cache-Control;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
        add_header Cache-Control max-age=7776000;
        add_header Access-Control-Allow-Origin *;
    }
  }


  error_page 404 /404.html;
    location = /40x.html {
  }

  error_page 500 502 503 504 /50x.html;
    location = /50x.html {
  }
}

# After the base app nuxtjs2 is deployed and listening on port 7000, set the proxy to port 7000, then you can access the base app via nuxtjs2.micro-zoe.com
server {
  listen       80;
  server_name  nuxtjs2.micro-zoe.com;

  root html;
  index index.html index.htm;

  location / {
    proxy_pass http://127.0.0.1:7000;
    proxy_set_header Host $host:80;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # add_header Cache-Control;
    if ( $request_uri ~* ^.+.(js|css|jpg|png|gif|tif|dpg|jpeg|eot|svg|ttf|woff|json|mp4|rmvb|rm|wmv|avi|3gp)$ ){
        add_header Cache-Control max-age=7776000;
        add_header Access-Control-Allow-Origin *;
    }
  }


  error_page 404 /404.html;
    location = /40x.html {
  }

  error_page 500 502 503 504 /50x.html;
    location = /50x.html {
  }
}
```

#### The result is as follows：
- main-vue2：[http://www.micro-zoe.com/main-vue2/](http://www.micro-zoe.com/main-vue2/)
