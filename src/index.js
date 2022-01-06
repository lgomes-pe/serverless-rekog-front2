import React, { useMemo, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 5,
  borderRadius: 2,
  borderColor: "blue",
  borderStyle: "dashed",
  backgroundColor: "navy",
  color: "white",
  outline: "none",
  transition: "border .24s ease-in-out"
};

const activeStyle = {
  borderColor: "#2196f3"
};

const acceptStyle = {
  borderColor: "#00e676"
};

const rejectStyle = {
  borderColor: "#ff1744"
};

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: "auto",
  height: 200,
  padding: 4,
  boxSizing: "border-box"
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden"
};

const img = {
  display: "block",
  width: "auto",
  height: "100%"
};

function StyledDropzone(props) {
  const axios = require("axios").default;
  const API_ENDPOINT = 'https://onhw31kegd.execute-api.eu-central-1.amazonaws.com/default/getSignedUrl'

  const handleChangeStatus = ({meta, remove}, status) => {
    console.log(status, meta);
  };

  const upload = async(acceptedFiles) => {
    for(var i=0; acceptedFiles.length; i++){
      const f = acceptedFiles[i];
      //GET request for the presigned URL
      const response = await axios({
        method: "GET",
        url: API_ENDPOINT,
      });

      //PUT request to upload the file to S3
      const result = await fetch(response.data.uploadURL, {
        method: "PUT",
        body: f["file"],
      });
    }
  };

  const [files, setFiles] = useState([]);
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    open
  } = useDropzone({
    onChangeStatus: handleChangeStatus,
    accept: "image/*",
    maxFiles: 10,
    multiple: true,
    canCancel: true,
    noClick: true,
    noKeyboard: true,
    inputContent: (files, extra) => (extra.reject ? 'Only images are allowed !' : "Drop Files or Click to browse"),
    styles: {
      dropzone: {width: 400, height: 200},
      dropzoneActive: {activeStyle},
      dropzoneReject: {rejectStyle},
      inputLabel: (files, extra) => (extra.reject ? {color: '#A02800'} : {})
    },
    onDrop: acceptedFiles => {
      setFiles(
        acceptedFiles.map(file =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
      //upload(acceptedFiles)
    }
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }),
    [isDragActive, isDragReject]
  );

  const thumbs = files.map(file => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img src={file.preview} style={img} />
      </div>
    </div>
  ));

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach(file => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  const filepath = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const submit = (
    <button onClick={() => upload(acceptedFiles)}>Submit</button>
  )

  return (
    <div className="container">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here</p>
        <button type="button" onClick={open}>
          Open File Dialog
        </button>
      </div>
      <aside>
        <div>
          {submit}
        </div>
        <h4>Files</h4>
        <ul>{filepath}</ul>
      </aside>
      <aside style={thumbsContainer}>{thumbs}</aside>
    </div>
  );
}

ReactDOM.render(<StyledDropzone />, document.getElementById("root"));
