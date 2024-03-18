---
title: Postman的一些高级用法使用案例
date: 2021-05-27 02:00:00
tags:
---

[https://www.zhihu.com/question/24677836](https://www.zhihu.com/question/24677836)

postman 做的事情就是模拟浏览器发送请求，接受响应。使用Postman可以模拟任何浏览器发出的请求，可以自由地构造请求地址，请求方法，请求内容，Cookies等。Postman的响应内容包括完整的响应头，响应时间，响应大小，cookie等内容。  
此外，postman还提供如下方便功能：

-   [Debugging and logs](https://link.zhihu.com/?target=https%3A//link.jianshu.com/%3Ft%3Dhttps%3A//www.getpostman.com/docs/postman/sending_api_requests/debugging_and_logs)：可以在控制台对postman的请求进行调试，特别是如果有pre-request或者test script时，使用控制台可以方便debug。原生postman可以通过`CMD/CTRL + ALT + C`打开控制台。
-   [Generate code snippets](https://link.zhihu.com/?target=https%3A//link.jianshu.com/%3Ft%3Dhttps%3A//www.getpostman.com/docs/postman/sending_api_requests/generate_code_snippets)：将当前请求导出为各种版本的请求代码，比如python，js，curl等，方便用命令行测试；
-   [Proxy](https://link.zhihu.com/?target=https%3A//link.jianshu.com/%3Ft%3Dhttps%3A//www.getpostman.com/docs/postman/sending_api_requests/proxy)：如果本机不能直接访问服务端，可以在`Settings-Proxy-Using custom/system proxy`设置代理；
-   [Capturing HTTP requests](https://link.zhihu.com/?target=https%3A//link.jianshu.com/%3Ft%3Dhttps%3A//www.getpostman.com/docs/postman/sending_api_requests/capturing_http_requests)：有时候用手机访问服务端时，我们可能需要借助fiddler来查看HTTP请求。postman也可以做相同的工作，只需要将postman作为代理转发HTTP请求即可。
-   [Certificates](https://link.zhihu.com/?target=https%3A//link.jianshu.com/%3Ft%3Dhttps%3A//www.getpostman.com/docs/postman/sending_api_requests/certificates)： 如果服务端要验证客户端证书，可以在`Settings-Certificates-Add Certificate`配置证书；