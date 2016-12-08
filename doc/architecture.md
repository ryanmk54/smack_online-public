# Project Controller / View Interaction
## Edit
1. A hidden form is sent with the following:
    * id
    * title
    * input as base64
    * output
2. As soon as the DOM is loaded, 
  1. loadEditor is called with the base64Input.
  2. the file list is populated

