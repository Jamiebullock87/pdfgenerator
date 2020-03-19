# My Fancy PDF Generator
I built this to be an endpoint to enable easy pdf generation for multiple use cases. You can create as many different layouts as you want in the views folder, and use CSS3, so CSS grid and flexbox will all work here. No more using HTML2 and CSS 2 and building with tables as with most PDF generators out there. I was sick of having to resort to a piece of 10 year old software and using html tables and inline styling to accomplish a basic pdf layout.

You can extend the app.js templateData object to accept any kind of data you want to output in your pdf, then create your layout with html5 and css3 in the views folder.

The index.html is an example file meant to show how to use the app on another site.

Link whatever action you want to create the pdf to a similar function on your front end. Send an http request to the endpoint where the pdf generator lives with the body as an object. Originally built for an e commerce website selling skincare products, but it can be heavily customised to suit whatever you need.

A button on the front end or back end of a cms can target the http request function on a click event. Again this will probably need customising depending on what you want to do with it.
