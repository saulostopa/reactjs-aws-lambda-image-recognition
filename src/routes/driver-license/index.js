import React, { Component } from "react";

import { uniqueId } from "lodash";
import filesize from "filesize";

import api from "./../../services/api";

import GlobalStyle from "./../../styles/global";
import { Container, Content } from "./../../styles/styles";

import Upload from "./../../components/Upload";
import FileList from "./../../components/FileList";
import { Odometer } from "./../../components/FileList/styles";

const txtAnalysing = 'Analysing your document...';
class App extends Component {
  state = {
    uploadedFiles: [],
    recognized: 0,
    textDefault: [],
    textFirstName: 1,
    textLastName: [],
    textDateOfBirth: [],
    textLicenseState: [],
    textLicenseExpirationDate: [],
    textLicenseNumber: [],
    key: [],
    currentImgId: [0]
  };

  handleUpload = files => {
    
    this.setState({ textDefault: txtAnalysing });
    this.setState({ textFirstName: 1 });
    this.setState({ textLastName: txtAnalysing });
    this.setState({ textDateOfBirth: txtAnalysing });
    this.setState({ textLicenseState: txtAnalysing });
    this.setState({ textLicenseExpirationDate: txtAnalysing });
    this.setState({ textLicenseNumber: txtAnalysing });
    
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
        let result = [];
        let dataDocument = [];
        
        api.get(`${process.env.REACT_APP_AWS_API_LAMBDA_DRIVER_LICENSE}?key=${fileName}`)
          .then(function (responseApi) {
            console.log('responseApi',responseApi)
            responseApi.data.forEach(element => {
              if (element.Type.Text === 'FIRST_NAME') {
                if ( element.ValueDetection.Text !== '' ) {
                  result.push({'firstName': element.ValueDetection.Text});
                } else {
                  result.push(false);
                }
              }
              if (element.Type.Text === 'LAST_NAME') {
                if ( element.ValueDetection.Text !== '' ) {
                  result.push({'lastName': element.ValueDetection.Text});
                } else {
                  result.push(false);
                }
              }
              if (element.Type.Text === 'STATE_NAME') {
                if ( element.ValueDetection.Text !== '' ) {
                  result.push({'licenseState': element.ValueDetection.Text});
                } else {
                  result.push(false);
                }
              }
              if (element.Type.Text === 'DOCUMENT_NUMBER') {
                if ( element.ValueDetection.Text !== '' ) {
                  result.push({'licenseNumber': element.ValueDetection.Text});
                } else {
                  result.push(false);
                }
              }
              if (element.Type.Text === 'EXPIRATION_DATE') {
                if ( element.ValueDetection.Text !== '' ) {
                  result.push({'licenseExpirationDate': element.ValueDetection.Text});
                } else {
                  result.push(false);
                }
              }
              if (element.Type.Text === 'DATE_OF_BIRTH') {
                if ( element.ValueDetection.Text !== '' ) {
                  result.push({'dateOfBirth': element.ValueDetection.Text});
                } else {
                  result.push(false);
                }
              }
            });
            dataDocument = result;
            console.log('result',result);
          })
          .catch(function (error) {
            console.log(error);
          })
          .then(() => {
            if ( result.includes(false) ) {
              this.setState({ recognized: false })
            }
            else {
              this.setState({ recognized:                 true })
              this.setState({ textFirstName:              dataDocument[0].firstName });
              this.setState({ textLastName:               dataDocument[1].lastName });
              this.setState({ textLicenseState:           dataDocument[2].licenseState });
              this.setState({ textLicenseNumber:          dataDocument[3].licenseNumber });
              this.setState({ textLicenseExpirationDate:  dataDocument[4].licenseExpirationDate });
              this.setState({ textDateOfBirth:            dataDocument[5].dateOfBirth });
            }
          });
    })
  }

  processUpload = uploadedFile => {
    const data = new FormData();
    data.append("file", uploadedFile.file, uploadedFile.name);
    let fileName = ''

    api.post(`posts`, data, {
        onUploadProgress: e => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total));
          this.updateFile(uploadedFile.id, {
            progress
          });
        }
      })
      .then(response => {

        fileName = response.data.key
        this.callApiRekognition(fileName);
        
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
    this.setState({ uploadedFiles:              this.state.uploadedFiles.filter(file => file.id !== id)});
    this.setState({ textFirstName:              '' });
    this.setState({ textLastName:               '' });
    this.setState({ textLicenseState:           '' });
    this.setState({ textLicenseNumber:          '' });
    this.setState({ textLicenseExpirationDate:  '' });
    this.setState({ textDateOfBirth:            '' });
    this.setState({ textDefault:                [] });
  };

  componentWillUnmount() {
    this.state.uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
  }

  render() {
    const { uploadedFiles } = this.state;
    const textDefault = this.state.textDefault;
    let recognized = this.state.recognized;
    let resultDoc;

    if (!textDefault.size) {
      resultDoc = '';
    }

    if (textDefault === 'Analysing your document...') {
      resultDoc = <Odometer><><p className="textDefault">Analysing your document...</p></></Odometer>;
    }

    if (recognized !== 0 && !recognized) {
      resultDoc = <Odometer><><p className="textDefault">Your document wasn't recognized.<br />Please try again.</p></></Odometer>;
    }

    if (recognized !== 0 && recognized) {
      resultDoc = <Odometer>
      <><h2>Document Recognized</h2>
      <h4>First Name</h4>
      {this.state.textFirstName}
      <br></br>
      <h4>Last Name</h4>
      {this.state.textLastName}
      <br></br>
      <h4>Date of Birth</h4>
      {this.state.textDateOfBirth}
      <br></br>
      <h4>License State</h4>
      {this.state.textLicenseState}
      <br></br>
      <h4>License Expiration Date</h4>
      {this.state.textLicenseExpirationDate}
      <br></br>
      <h4>License Number</h4>
      {this.state.textLicenseNumber}
      </>
      </Odometer>;
    }
    
    return (
        <>
        <Container>
        <Content>
          <Upload onUpload={this.handleUpload} />
          {!!uploadedFiles.length && (
            <FileList files={uploadedFiles} onDelete={this.handleDelete} />
          )}
          
          {resultDoc}

        </Content>
        <GlobalStyle />
      </Container></>
    );
  }
}
export default App;