import React, { Component } from "react";

import { uniqueId } from "lodash";
import filesize from "filesize";

import api from "./../../services/api";

import GlobalStyle from "./../../styles/global";
import { Container, Content } from "./../../styles/styles";

import Upload from "./../../components/Upload";
import FileList from "./../../components/FileList";
import { Odometer } from "./../../components/FileList/styles";

const axios = require('axios');
const txtAnalysing = 'Analysing your odometer...';

class App extends Component {
  state = {
    uploadedFiles: [],
    textOdometer: [],
    key: [],
    currentImgId: [0]
  };

  handleUpload = files => {
    
    this.setState({ textOdometer: txtAnalysing });

    if ( this.state.currentImgId !== [0] ) {
      this.handleDelete(this.state.currentImgId)
    }
    
    const uploadedFiles = files.map(file => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null,
      odometer: null
    }));

    this.setState({
      uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles)
    });

    uploadedFiles.forEach(this.processUpload);
  };

  updateFile = (id, data) => {
    this.setState({
      uploadedFiles: this.state.uploadedFiles.map(uploadedFile => {
        return id === uploadedFile.id
          ? { ...uploadedFile, ...data}
          : uploadedFile;
      })
    });
  };

  callApiRekognition = fileName => {
    return new Promise(resolve =>{
        let odToSend = []
        axios.post(`${process.env.REACT_APP_AWS_API_LAMBDA}/?key=${fileName}`)
          .then(function (responseApi) {
            // handle success
            odToSend = responseApi['data'][0]
            console.log('odToSend',odToSend)
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(() => {
            if ( odToSend === undefined )
            {
              this.setState({ textOdometer: "Your photo wasn't recognized. Please try again." });
            } else {
              this.setState({ textOdometer: odToSend });
            }
          });
    })
  }

  processUpload = uploadedFile => {
    const data = new FormData();
    data.append("file", uploadedFile.file, uploadedFile.name);
    let fileName = ''
    
    api.post("posts", data, {
        onUploadProgress: e => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total));

          this.updateFile(uploadedFile.id, {
            progress
          });
        }
      })
      .then(response => {
        fileName = response.data.key
        const res1 = this.callApiRekognition(fileName);
        console.log('fileName1',fileName)
        console.log('res1',res1)

        // setting the last id to remove when upload a new one
        this.setState({currentImgId: response.data._id});

        this.updateFile(uploadedFile.id, {
          uploaded: true,
          id: response.data._id,
          url: response.data.url
        });
      })
  };

  handleDelete = async id => {
    await api.delete(`posts/${id}`);

    let removeTxtOdometer = ''
    if ( this.state.textOdometer !== txtAnalysing ) {
      removeTxtOdometer = ''
    } else {
      removeTxtOdometer = txtAnalysing
    }

    this.setState({
      uploadedFiles: this.state.uploadedFiles.filter(file => file.id !== id),
      textOdometer: removeTxtOdometer
    });
  };

  componentWillUnmount() {
    this.state.uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
  }

  render() {
    const { uploadedFiles } = this.state;
    console.log('state final', this.state);
    return (
        <>
        <Container>
        <Content>
          <Upload onUpload={this.handleUpload} />
          {!!uploadedFiles.length && (
            <FileList files={uploadedFiles} onDelete={this.handleDelete} />
          )}
          <Odometer>
            <h3>Odometer Recognized</h3>
            {this.state.textOdometer}
          </Odometer>
        </Content>
        <GlobalStyle />
      </Container></>
    );
  }
}

export default App;
