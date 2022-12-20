import React, { Component } from "react";

import Dropzone from "react-dropzone";

import { DropContainer, UploadMessage } from "./styles";

export default class Upload extends Component {
  renderDragMessage = (isDragActive, isDragReject) => {
    if (!isDragActive) {
      return <UploadMessage>Drag and Drop Image Here...</UploadMessage>;
    }

    if (isDragReject) {
      return <UploadMessage type="error">File not supported</UploadMessage>;
    }

    return <UploadMessage type="success">Drag and Drop Image Here</UploadMessage>;
  };

  render() {
    const { onUpload } = this.props;
    const onAccept = {'image/*': []};

    return (
      <Dropzone accept={onAccept} onDropAccepted={onUpload}>
        {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
          <DropContainer
            {...getRootProps()}
            isDragActive={isDragActive}
            isDragReject={isDragReject}
          >
            <input {...getInputProps()} />
            {this.renderDragMessage(isDragActive, isDragReject)}
          </DropContainer>
        )}
      </Dropzone>
    );
  }
}
