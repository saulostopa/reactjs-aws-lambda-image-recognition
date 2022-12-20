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
const txtAnalysing = 'Analysing your document...';
class App extends Component {
  state = {
    uploadedFiles: [],
    textOdometer: [],
    textVIN: [],
    textYear: [],
    textDateExp: [],
    textState: [],
    textModel: [],
    textType: [],
    key: [],
    currentImgId: [0]
  };

  handleUpload = files => {
    
    this.setState({ textOdometer: txtAnalysing });
    this.setState({ textVIN: txtAnalysing });
    this.setState({ textYear: txtAnalysing });
    this.setState({ textDateExp: txtAnalysing });
    this.setState({ textState: txtAnalysing });
    this.setState({ textModel: txtAnalysing });
    this.setState({ textType: txtAnalysing });

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
        let dataVIN = [];
        let dataDateExp = [];
        let dataStateReko = [];
        let dataYearReko = [];
        
        axios.post(`${process.env.REACT_APP_AWS_API_LAMBDA_VEHICLE_DOCUMENT}?key=${fileName}`)
          .then(function (responseApi) {
            if (responseApi.data.getVIN.length > 0) {
              dataVIN       = responseApi.data.getVIN;
              dataDateExp   = responseApi.data.getDateExp;
              dataStateReko = responseApi.data.getState;
              dataYearReko  = responseApi.data.getYear;
            }
          })
          .catch(function (error) {
            console.log(error);
          })
          .then(() => {
            if (dataVIN.length === 0) {
              this.setState({ textVIN:   "Not Recognized" });
              this.setState({ textYear:  "Not Recognized" });
              this.setState({ textState: "Not Recognized" });
              this.setState({ textModel: "Not Recognized" });
              this.setState({ textType:  "Not Recognized" });
            } else {
              this.setState({ textVIN: dataVIN });

              if (dataDateExp.length === 0) {
                this.setState({ textDateExp: "Not Recognized" });
              } else {
                this.setState({ textDateExp: dataDateExp });
              }

              console.log('dataYearReko',dataYearReko)
              console.log('dataStateReko',dataStateReko)

              if (dataStateReko.length === 0) {
                this.setState({ textState: "Not Recognized" });
              } else {
                this.setState({ textState: dataStateReko });
              }

              if (dataYearReko === undefined) {
                this.setState({ textYear: "Not Recognized" });
              } else {
                this.setState({ textYear: dataYearReko });
              }

              this.callApiVinNHTSA(dataVIN);
            }
          });
    })
  }

  callApiVinNHTSA = vin => {
    return new Promise(resolve =>{
        let dataYear  = [];
        let dataModel = [];
        let dataType  = [];

        axios.get(`${process.env.REACT_APP_API_BE_NHTSA}/${vin}?format=json`)
          .then(function (responseApi) {
            if (responseApi.data != null && responseApi.data.Results.length > 0) {
              for (let i = 0; i < responseApi.data.Results.length; i++) {
                if ( responseApi.data.Results[i]['ModelYear'] !== "" ) {
                  dataYear.push(responseApi.data.Results[i]['ModelYear'])
                } else {
                  dataYear.push(this.state.textYear)
                }
                // if ( responseApi.data.Results[i]['PlantState'] !== "" ) {
                //   dataState.push(responseApi.data.Results[i]['PlantState'])
                // } else {
                //   dataState.push(this.state.textState)
                // }
                if ( responseApi.data.Results[i]['Model'] ) {
                  dataModel.push(responseApi.data.Results[i]['Model'])
                }
                if ( responseApi.data.Results[i]['VehicleType'] ) {
                  dataType.push(responseApi.data.Results[i]['VehicleType'])
                }
              }
            }
          })
          .catch(function (error) {
            console.log(error);
          })
          .then(() => {

            // console.log('state DP', dataState);
            console.log('year DP', dataYear);

            if (dataYear === undefined || dataYear.length === 0) {
              this.setState({ textYear: "Not Recognized" });
            } else {
              this.setState({ textYear: dataYear });
            }
            // if (dataState === undefined || dataState.length === 0) {
            //   this.setState({ textState: "Not Recognized" });
            // } else {
            //   this.setState({ textState: this.dataState });
            // }
            if (dataModel.length === 0) {
              this.setState({ textModel: "Not Recognized" });
            } else {
              this.setState({ textModel: dataModel });
            }
            if (dataType.length === 0) {
              this.setState({ textType: "Not Recognized" });
            } else {
              this.setState({ textType: dataType });
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
    return (
        <>
        <Container>
        <Content>
          <Upload onUpload={this.handleUpload} />
          {!!uploadedFiles.length && (
            <FileList files={uploadedFiles} onDelete={this.handleDelete} />
          )}
          <Odometer>
            <h2>Document Recognized</h2>
            <h4>VIN</h4>
            {this.state.textVIN}
            <br></br>
            <h4>Vehicle Year</h4>
            {this.state.textYear}
            <br></br>
            <h4>Date Expiration</h4>
            {this.state.textDateExp}
            <br></br>
            <h4>State</h4>
            {this.state.textState}
            <br></br>
            <h4>Model</h4>
            {this.state.textModel}
            <br></br>
            <h4>Type</h4>
            {this.state.textType}
          </Odometer>
        </Content>
        <GlobalStyle />
      </Container></>
    );
  }
}
export default App;