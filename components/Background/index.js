import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, ImageBackground, KeyboardAvoidingView, View } from 'react-native';

export default class Background extends Component {

  render() {
    const { source } = this.props

    return (
      <KeyboardAvoidingView behavior='padding' enabled >
        <ImageBackground style={Styles.picture} source={source}>
            {this.props.children}
        </ImageBackground>
      </KeyboardAvoidingView>

    )
  }

}

const Styles = StyleSheet.create({
  picture: {
    width: '100%',
    height: '100%',
  }
});

Background.propTypes = {
  source: PropTypes.number.isRequired
}