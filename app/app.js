import React, { Component } from "react";
import ReactDom from 'react-dom';
// import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./styles/styles.css";
import VideoComponent from "./VideoComponent";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from "react-tap-event-plugin";
injectTapEventPlugin();


ReactDom.render(
    <MuiThemeProvider>
        <BrowserRouter>
                <VideoComponent />
        </BrowserRouter>
    </MuiThemeProvider> ,
    document.getElementById("app")
);
