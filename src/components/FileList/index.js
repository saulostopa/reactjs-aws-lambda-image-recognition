import React from "react";
import CircularProgressbar from "react-circular-progressbar";
import { MdCheckCircle, MdDelete, MdError, MdLink } from "react-icons/md";
import { Container, FileInfo, Preview } from "./styles";
import PrismaZoom from 'react-prismazoom'

const FileList = ({ files, onDelete, odometer }) => (
  <Container>
    {files.map(uploadedFile => (
      <li key={uploadedFile.id} className="imgUploaded">
        <FileInfo className="zoomOverFlow">
          <PrismaZoom>
            <Preview src={uploadedFile.preview} className="zoomHover_" />
          </PrismaZoom>
        </FileInfo>
        

        <div className="link">
          <div className="svg">
            {uploadedFile.uploaded && <MdCheckCircle size={24} color="#78e5d5" />}
            {uploadedFile.error && <MdError size={24} color="#e57878" />}
          </div>

          <div>
            <strong>{uploadedFile.name}</strong>
            <span> | {uploadedFile.readableSize}{" "}</span>
          </div>
          <div>
          Image Link:<br />
          {uploadedFile.url && (
            <a
              href={uploadedFile.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MdLink style={{ marginRight: 8 }} size={24} color="#222" />
            </a>
          )}
          </div>
          
          {!uploadedFile.uploaded &&
          !uploadedFile.error && (
            <CircularProgressbar
            
              styles={{
                root: { width: 24 },
                path: { stroke: "#7159c1" }
              }}
              strokeWidth={10}
              percentage={uploadedFile.progress}
            />
          )}
          
          
          <div className="delete">
          {!!uploadedFile.url && (
            <button className="btDelete" onClick={() => onDelete(uploadedFile.id)}>
              <MdDelete className="svgDelete" style={{ marginRight: 8 }} size={24} color="#222" />
            </button>
          )}
          </div>

          
        </div>
      </li>
    ))}
  </Container>
);

export default FileList;
