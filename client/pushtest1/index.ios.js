import React, {Component} from 'react'
import ReactNative from 'react-native'
let {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  PushNotificationIOS,
  AlertIOS,
} = ReactNative


let Button = React.createClass({
  render: function() {
    return (
      <TouchableHighlight
        underlayColor={'white'}
        style={styles.button}
        onPress={this.props.onPress}>
        <Text style={styles.buttonLabel}>
          {this.props.label}
        </Text>
      </TouchableHighlight>
    )
  }
})


class pushtest1 extends Component {

  constructor(){
    super()
    this.state = {messages: ['registering...\n']}
  }


  render() {
    return (
      <View style={styles.container}>

        <Button
          label={'check permissions'}
          onPress={()=>{
            PushNotificationIOS.checkPermissions((permissions) => {
              this.state.messages.push(`permissions: ${JSON.stringify(permissions)}\n`)
              this.setState(this.state)
            })
          }}
        />

        <Text style={styles.instructions}>
          {this.state.messages}
        </Text>
      </View>
    )
  }


  componentWillMount() {
    PushNotificationIOS.addEventListener('notification', this._onNotification.bind(this))
    PushNotificationIOS.addEventListener('register', this._onRegistration.bind(this))
    PushNotificationIOS.requestPermissions({badge: 1, sound: 1, alert: 1})
  }


  componentWillUnmount() {
    PushNotificationIOS.removeEventListener('notification', this._onNotification)
    PushNotificationIOS.removeEventListener('register', this._onNotification)
  }


  _sendNotification() {
    require('RCTDeviceEventEmitter').emit('remoteNotificationReceived', {
      aps: {
        alert: 'Sample notification',
        badge: '+1',
        sound: 'default',
        category: 'REACT_NATIVE'
      },
    })
  }


  _onNotification(notification) {
    AlertIOS.alert(
      'Notification Received',
      'Alert message: ' + notification.getMessage(),
      [{
        text: 'Dismiss',
        onPress: null,
      }]
    )
  }


  _onRegistration(token){
    this.state.messages.push(`token: ${token}\n`)
    this.setState(this.state)
  }


  _showPermissions() {
    PushNotificationIOS.checkPermissions((permissions) => {
      this.state.push(`permissions: ${permissions}\n`)
      this.setState(this.state)
    })
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#F5FCFF',
    padding: 10,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'left',
    color: '#333333',
    marginBottom: 0,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    padding: 4,
    color: 'blue',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'blue',
  },
})


AppRegistry.registerComponent('pushtest1', () => pushtest1)
