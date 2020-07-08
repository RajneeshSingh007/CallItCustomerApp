/** @format */
import './src/i18n/init';
import React, { Component } from "react";
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import {
    Colors,
    DefaultTheme,
    Provider as PaperProvider
} from "react-native-paper";
import stores from "./src/mobx";
import { Provider } from "mobx-react";
import * as ReactNative from "react-native";
import codePush from "react-native-code-push";
import * as Pref from './src/util/Pref';

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#3daccf',
        accent: '#292929',
        backgroundColor: 'white',
        surface: Colors.white
    }
};

ReactNative.I18nManager.allowRTL(true);
ReactNative.I18nManager.forceRTL(true);
Pref.setVal(Pref.TempBizData, null);
Pref.setVal(Pref.TempLocBranchData, null);
Pref.setVal(Pref.TempLocOzranchData, null);
Pref.setVal(Pref.AskedLocationDailog, null);

console.disableYellowBox = true;

function Main() {
    return (
        <Provider {...stores}>
            <PaperProvider theme={theme}>
                <App />
            </PaperProvider>
        </Provider>
    );
}

const options = {
    updateDialog: {
        title: 'קיים עדכון חדש',
        appendReleaseDescription: true,
        descriptionPrefix: "יש להתקין את העדכון על מנת להמשיך להנות מהאפליקציה במלואה",
        mandatoryContinueButtonLabel: 'עדכון',
        mandatoryUpdateMessage: 'יש להתקין את העדכון על מנת להמשיך להנות מהאפליקציה במלואה',
        optionalInstallButtonLabel: 'עדכון'
    },
    installMode: codePush.InstallMode.IMMEDIATE,
    checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
    deploymentKey: Pref.STAGING_CODE_PUSH,
};

AppRegistry.registerComponent(appName, () => codePush(options)(Main));

//AppRegistry.registerComponent(appName, () => Main);
