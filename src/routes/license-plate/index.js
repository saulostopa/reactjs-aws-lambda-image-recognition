import React, { Component } from "react";

import { uniqueId } from "lodash";
import filesize from "filesize";

import api from "./../../services/api";

import GlobalStyle from "./../../styles/global";
import { Container, Content } from "./../../styles/styles";

import Upload from "./../../components/Upload";
import FileList from "./../../components/FileList";
import { Odometer } from "./../../components/FileList/styles";

const txtAnalysing = 'Analysing...';
class App extends Component {
  state = {
    uploadedFiles: [],
    textOdometer: [],
    textDateExp: [],
    textType: [],
    key: [],
    currentImgId: [0],

    textVIN:              [],
    textYear:             [],
    textState:            [],
    textMake:             [],
    textModel:            [],
    textPlate:            [],
    textTransmissionType: [],
    textFuelType:         [],
  };

  setOrConfirmPlate = (event) => {
    this.setState({textPlate: event.target.value});
  }

  handleUpload = files => {
    
    this.setState({ textOdometer:         txtAnalysing });
    this.setState({ textDateExp:          txtAnalysing });
    this.setState({ textType:             txtAnalysing });

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

  processUpload = uploadedFile => {
    const data = new FormData();
    data.append("file", uploadedFile.file, uploadedFile.name);
    
    api.post("/getLicensePlateRecognition", data, { // http://34.193.194.131:3000
        onUploadProgress: e => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total));
          this.updateFile(uploadedFile.id, {
            progress
          });
        }
      })
      .then(response => {

        console.log('response', response);

        if (response.data.error === true) {
          this.setState({ textPlate:            "Not Recognized" });
          this.setState({ textState:            "Not Recognized" });

          this.setState({ textVIN:              "Not Recognized" });
          this.setState({ textYear:             "Not Recognized" });
          this.setState({ textMake:             "Not Recognized" });
          this.setState({ textModel:            "Not Recognized" });
          this.setState({ textTransmissionType: "Not Recognized" });
          this.setState({ textFuelType:         "Not Recognized" });
        } else {
          this.setState({ textPlate:            response.data.plate });
          this.setState({ textState:            response.data.state });
        }

        this.setState({currentImgId: response.data._id});

        this.updateFile(uploadedFile.id, {
          uploaded: true,
          id: response.data._id,
          url: response.data.url
        });
      })
  };

  findVehicleInformation = () => {
    const getPlate = document.getElementById('textPlateRecognized')
    console.log('typed',getPlate.value);

    this.setState({ textVIN:              txtAnalysing });
    this.setState({ textYear:             txtAnalysing });
    this.setState({ textMake:             txtAnalysing });
    this.setState({ textModel:            txtAnalysing });
    this.setState({ textTransmissionType: txtAnalysing });
    this.setState({ textFuelType:         txtAnalysing });
    
    const state = this.state.textState;
    const plate = getPlate.value;
    let resultLicensePlate = [];
    
    api.get(`/getLicensePlateInformation/?plate=${plate}&state=${state}`)
      .then(function (response) {
        console.log('response',response);
        resultLicensePlate = response.data;
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(() => {
        this.setState({ textVIN:              resultLicensePlate.VIN });
        this.setState({ textYear:             resultLicensePlate.year });
        this.setState({ textMake:             resultLicensePlate.make });
        this.setState({ textModel:            resultLicensePlate.model });
        this.setState({ textTransmissionType: resultLicensePlate.transmissionType });
        this.setState({ textFuelType:         resultLicensePlate.fuelType });
      });
  }

  handleDelete = async id => {
    await api.delete(`/posts/${id}`);

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
            <h2>Recognitions</h2>
            
            <h4>Plate Recognized</h4>
            <input type="text" id="textPlateRecognized" style={{textAlign: "center"}} value={this.state.textPlate} onChange={this.setOrConfirmPlate} />
            <br />
            <h4>State</h4>
            {this.state.textState}
            <br />
            <br />
            
            <input type="button" onClick={this.findVehicleInformation} value="Check" />
            <br />
            <br />

            <hr />
            

            <h4>VIN</h4>
            {this.state.textVIN}
            <br></br>
            
            <h4>Vehicle Year</h4>
            {this.state.textYear}
            <br></br>
            
            <h4>Make</h4>
            {this.state.textMake}
            <br></br>

            <h4>Model</h4>
            {this.state.textModel}
            <br></br>

            <h4>Transmission</h4>
            {this.state.textTransmissionType}
            <br></br>

            <h4>Fuel</h4>
            {this.state.textFuelType}
          </Odometer>
        </Content>
        <GlobalStyle />
      </Container></>
    );
  }
}
export default App;