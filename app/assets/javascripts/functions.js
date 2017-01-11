filePaths = ["simple.c"]
createFilePathsObject(filePaths);

function createFilePathsObject(filePaths) {
  data = [];

  let prefix = "";
  let dataIndex = 0;
    // the index where children should be added
  filePaths.forEach(function(filePath) {

    if (filePath.startsWith(prefix)) {
      // continue down the path
      
      // if (filepath - prefix) contains a /
      //  set the label up to the last /
      //  add it to the prefix
      // else
      //  set the lable up to the end
      let label = "";
      filePath = filePath.substring(prefix.length);
      if (filePath.includes('/')) {
        label = filePath.substring(0, filePath.indexOf('/'));
        prefix += filePath;
      }
      else {
        label = filePath;
      }

      data[dataIndex] = data[dataIndex] ||  {};
      data[dataIndex].label = label;
    }
    else {
      // reset the prefix and start over
      prefix = "";
      dataIndex += 1;
    }

    /*
     * This part is old. I am not using it for now
    // first filePath is either a file or folder
    // if it ends in a / it is a folder
    // else a file
    if (filePath.endsWith('/') {
      filePathParts = filePath.split('/');
      numParts filePathParts.length;
      label = 

      label = filePath.split('/')
    }
    */
    
  });

  debugger;
  return data;
}
