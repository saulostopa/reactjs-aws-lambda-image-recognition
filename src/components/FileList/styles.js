import styled from "styled-components";

export const Container = styled.ul`
  margin-top: 20px;

  li.imgUploaded {
    display:block;
    text-align:center;
    div {
      div {
        width: 360px;
        height: 225px;
        background-position: 100% 100%;
        margin-right:0px;
      }
    }
  }

  .btDelete {
    background-color: transparent;
    border: none;
  }

  .zoomOverFlow {
    overflow: hidden;
  }
  .zoomHover {
    transition: all 0.3s ease 0s;
    width: 100%;
  }
  .zoomHover:hover {
    transform:scale(4.00);
  }

  .svgDelete {
    height: 24px!important;
    width: 26px!important;
  }

  div.delete {
    height:47px;
    overflow:visible;
  }

  div.svg svg {
    margin-right:8px;
  }

  li {
    display:block;
    div.link {
      height:200px;
      div {
        width: auto;
        height: auto;
        background-position: 100% 100%;
        margin-right: 0px;
        /* display: inline-block; */
        padding: 10px;
      }
      div.delete {
        
      }
    }
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #444;

    & + li {
      margin-top: 15px;
    }
  }
`;

export const Odometer = styled.div`
  margin-top: 20px;
  min-height:47px;
  display: block;
  text-align: center;
  border: 1px dashed #f85731;
  border-radius: 4px;
  transition: height 0.2s ease;
  padding: 5px;

  div {
    display: flex;
    flex-direction: column;

    span {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
  }
`;

export const FileInfo = styled.div`
  display: flex;
  align-items: center;

  div {
    display: flex;
    flex-direction: column;

    span {
      font-size: 12px;
      color: #999;
      margin-top: 5px;

      button {
        border: 0;
        background: transparent;
        color: #e57878;
        margin-left: 5px;
        cursor: pointer;
      }
    }
  }
`;

export const Preview = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 5px;
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
  margin-right: 10px;
`;
