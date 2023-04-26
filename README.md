## PhotoEditing using canvas blend modes in React

This is a proof of concept for an image filtering app using canvas blend modes.

![Screen Shot 2023-04-25 at 7 07 18 PM](https://user-images.githubusercontent.com/14415867/234436121-47cd87b1-a3a7-4b1e-81a2-da5b1f0c55c2.png)




https://user-images.githubusercontent.com/14415867/234437531-1a350e89-2810-4b7c-9420-7dc210881434.mov




## Features
 Users can "paint" with detail, light, or color

The "detail" filter implements what is functionally an "unsharp" mask - by overlaying combining a blurred negative with the original, the contrast of the details is enhanced. A detailed look at this implementation can be found in my blog post [here](https://medium.com/skylar-salernos-tech-blog/mimicking-googles-pop-filter-using-canvas-blend-modes-d7da83590d1a). Painting detail into a selected area allows users to avoid oversharpening areas they wish to remain smooth, such as skin or a blurred background
 
 The light overlay is a powerful filter that can change the color, brighten the image, darken the image, depending on the shade used. Users can "paint" different colors onto different areas of the photo to give a two toned effect or to selectively brighten areas of an image, such as someones face.

The color replace filter works by a wholesale "coloring in" of the photo with the users chosen color. However, by adjusting the opacity of the effect, the user regains some control over the strength of the effect. Because this "coloring in" uses a simple HSL hue shift, and its not the best at creating "natural" looking re-color compared to an operation designed specifically for this purpose, but it can still create some fun effect.
  
 For more detail on the HSL color scale, see my blog post on [specifying colors on the web](https://medium.com/skylar-salernos-tech-blog/specifying-colors-on-the-web-11aeed3f5d6)

### Running the App
This app is built with React. To Run it:
1) Run `npm build` to install React and other dependencies
2) Run `npm start` to start a local server
3) To generate a build, run `npm build`
