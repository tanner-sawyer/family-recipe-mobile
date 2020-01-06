import React, { Component } from 'react';
import PropTypes from 'prop-types';
import  * as Expo from 'expo';
import SessionService from '../services/session';

import { 
  StyleSheet, 
  View, 
  Text, 
  Image,
  TextInput,
  TouchableOpacity,
  TouchableHighlight, 
  AsyncStorage,
  Button
} from 'react-native';

import background from '../assets/images/background.png'
import Logo from '../assets/images/logo.png'
import Fingerprint from '../assets/images/Thumbprint.png'
import SuccessCheck from '../assets/images/success.png'
import FailedX from '../assets/images/failed.png'
import Background from '../components/Background';


function LoginTextInput({ placeholder, onChangeText, textContentType, value, secureTextEntry }) {
  return (
    <TextInput
      style={Styles.textInput}
      placeholder={placeholder}
      onChangeText={onChangeText}
      autoCorrect={false}
      textContentType={textContentType}
      value={value}
      secureTextEntry={secureTextEntry}
      underlineColorAndroid='#ffffff'
    />
  )
}

export default class LoginScreen extends Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props){
    super(props)
    this.state = {
      email : '',
      password : '',
      showTouchId : false,
      compatible : false,
      failedAuthentication : false,
      authenticated : false,
      attempts : 0,
      locked : false,
      showSignup : false
    }
  }

  componentDidMount(){
    this.checkDeviceForHardware()
  }

  checkDeviceForHardware = async () => {
    let compatible = await Expo.LocalAuthentication.hasHardwareAsync()
    console.log(compatible)
    this.setState({ compatible })
  }

  checkForBiometrics = async () => {
    let biometricRecords = await Expo.LocalAuthentication.isEnrolledAsync();
    if (!biometricRecords) {
      this.setState({ compatible : false })
      this.handleDropdownAlert(
        'warn',
        'No Biometrics Found',
        'Please ensure you have set up biometrics in your OS settings.'
      );
    } else {
      this.handleLoginPress();
    }
  };

  handleLoginPress = () => {
    this.setState({ showTouchId : true })
    this.scanBiometrics();
  };


  scanBiometrics = async () => {
    const { navigate } = this.props.navigation;
    let result = await Expo.LocalAuthentication.authenticateAsync('Biometric Scan.');
    if (result.success) {
      this.setState({ authenticated : true })
      navigate("Home")      
    } else {
      this.setState( (prevState) => ({ failedAuthentication : true, attempts : prevState.attempts++ }))
      if(this.state.attempts < 5){
        this.timeout = setTimeout(this.handleLoginPress, 1000)
      }
      else{
        this.setState({ locked : true })
      }
    }
  }

  handleEmailChange = (text) => {
    this.setState({ email : text })
  }

  handlePasswordChange = (text) => {
    this.setState({ password : text })
  }

  handleSubmit = () => {
    this._signInAsync()
  }

  handleDropdownAlert = (type, title, message) => {
    this.dropdown.alertWithType(type, title, message)
  }
  
  handleClosePopup = () => {
    this.setState({ showTouchId : false })
    clearTimeout(this.timeout)
  }

  _signInAsync = async () => {
    let result = await SessionService.login(this.state.email, this.state.password)
    console.log('result : ', result)
    if(result.token){
      await AsyncStorage.setItem('userToken', result.token);
      this.props.navigation.navigate('App');
    }
    else{
      console.log(result)
    }
  };

  handleShowSignup = () => {
    this.setState({ showSignup : true })
  }

  render() {

    const { 
      showTouchId, 
      authenticated, 
      failedAuthentication
    } = this.state

    let popup = null

    if(showTouchId){
      popup = 
      <View style={Styles.modal}>
        <Text style={Styles.modalTitle}>Fingerprint Verification for "Family Cookbook"</Text>
        <View style={Styles.innerModal}>
          <Image source={authenticated ? SuccessCheck : failedAuthentication ? FailedX : Fingerprint} style={ (authenticated || failedAuthentication) ? Styles.otherIndicator : Styles.fingerprint}/>
          <Text style={Styles.touchSensor}> {authenticated ? 'Authenticated' : failedAuthentication ? 'Authentication Failed' : 'Touch Sensor'} </Text>
        </View>
        <TouchableOpacity onPress={this.handleClosePopup}>
          <Text style={Styles.cancelTouchId}>Cancel</Text>
        </TouchableOpacity>
      </View>
    }

    return (
      <Background source={background}>
        <View style={Styles.outerContainer}>
          <View style={Styles.container}>
            <Image style={Styles.logo} source={Logo}/>
            <Text style={Styles.text}>Family Cookbook</Text>

            <LoginTextInput 
              style={Styles.textInput} 
              placeholder='Email' 
              onChangeText={this.handleEmailChange}
              value={this.state.email}
              textContentType='emailAddress'
              autoCorrect={false}
            />
            <LoginTextInput 
              style={Styles.textInput} 
              placeholder='Password'
              onChangeText={this.handlePasswordChange}
              value={this.state.password}
              textContentType='password'
              secureTextEntry={true}
              autoCorrect={false}
            />
            <TouchableOpacity 
              onPress={this.handleSubmit}
              style={Styles.button}
            >
              <Text style={Styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={this.handleShowSignup}
              style={Styles.signup}
            >
              <Text style={Styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={this.handleForgotPassword}
              style={Styles.forgotPassword}
            >
              <Text style={Styles.forgotPasswordText}>Forgot Password</Text>
            </TouchableOpacity>
            { this.state.compatible && 
            
              <TouchableHighlight onPress={this.checkForBiometrics}>
                <Image source={Fingerprint} style={Styles.fingerprint}/>
              </TouchableHighlight>
              // <Text style={Styles.fingerprintText}>Fingerprint</Text>
            }
            {popup}
          </View>
        </View>
      </Background>
    )
  }
}

const Styles = StyleSheet.create({
  outerContainer : {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container : {
    height: 460,
    width: '80%', 
    backgroundColor: '#ffffff',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo : {
    width: 120,
    height: 120,
  },
  text : {
    color: '#9a0606',
    fontFamily: 'thasadith',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 25,
  },
  textInput : {
    height: 40,
    width: 220,
    borderColor: '#9a0606',
    borderWidth: 1,
    marginBottom: 5,
    marginTop: 5,
    fontFamily: 'thasadith',
    borderRadius: 5,
    backgroundColor: '#ffffff',
    paddingLeft : 10,
    paddingRight : 10,
  },
  button : {
    marginTop: 20,
    width: 80,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderColor: '#9a0606',
    borderWidth: 1,
  },
  buttonText : {
    color : '#396379',    
  },
  signup: {
    marginTop: 10,
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    color: '#9a0606',
    fontFamily: 'thasadith',
    fontSize: 12,
  },
  forgotPassword: {
    marginTop: 5,
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordText: {
    color: '#9a0606',
    fontFamily: 'thasadith',
    fontSize: 12,
    marginBottom : 10
  },
  fingerprint : {
    height : 30,
    width : 21
  },
  otherIndicator : {
    height : 30,
    width : 30
  },
  fingerprintText : {

  },
  modal : {
    position: "absolute",
    alignSelf: 'center',
    height: 150,
    width : 235,
    backgroundColor : '#ffffff',
    borderColor : '#9a0606',
    borderWidth : 1,
    borderRadius : 5,
    justifyContent: 'center',
    alignItems : 'center',
  },
  modalTitle : {
    textAlign : 'center',
  },
  innerModal : {
    display: 'flex',
    flexDirection : 'row',
    justifyContent : 'center',
    alignItems : 'center',
    marginTop : 25,
  },
  touchSensor : {
    fontSize : 10,
    marginLeft : 5,
    color : '#bec2c6'
  },
  cancelTouchId : {
    color : '#396379',
    marginLeft : 150,
    marginTop: 20
  }
})

LoginScreen.propTypes = {

}
