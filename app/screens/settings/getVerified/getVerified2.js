import React, {Component} from 'react'
import {View, Text, StyleSheet, TouchableHighlight, AsyncStorage, Alert} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Colors from './../../../config/colors'
import Header from './../../../components/header'
import Option from './../../../components/getVerifiedOption'
import SettingsService from './../../../services/settingsService'
import UserInfoService from './../../../services/userInfoService'

export default class GetVerified extends Component {
    static navigationOptions = {
        title: 'Get verified',
    }

    constructor(props) {
        super(props);
        this.state = {
            user: '',
            email: '',
            email_status: '',
            mobile_number: '',
            mobile_number_status: '',
            basic_info: '',
            basic_info_status: '',
            address: '',
            address_status: '',
            proof_of_identity: '',
            proof_of_identity_status: '',
            advance_proof_of_address: '',
            advance_proof_of_identity_status: '',
            proof_of_address: '',
            proof_of_address_status: ''
        }
    }

    async componentWillMount() {
        this.getData()

        this.emails()

        this.mobiles()

        this.addresses()

        this.documents()
    }

    goTo = (path, name) => {
        this.props.navigation.navigate(path, {name})
    }

    getData=async()=>{
        let user = await AsyncStorage.getItem('user')
        user = JSON.parse(user)
        this.setState({
            user: user,
            email: user.email,
            mobile_number: user.mobile_number,
            basic_info: user.first_name + ' ' + user.last_name,
        })
        if (this.state.basic_info!=' ') {
            this.setState({
                basic_info_status: 'verified'
            })
        } else {
            this.setState({
                basic_info_status: 'incomplete'
            })
        }
    }

    emails=async()=>{
        let responseJson = await SettingsService.getAllEmails()
        if (responseJson.status === "success") {
            const data = responseJson.data;
            for (let i = 0; i < data.length; i++) {
                if (data[i].verified === 'true') {
                    this.setState({
                        email_status: 'Verified'
                    })
                }
            }
            if (this.state.email_status !== 'Verified') {
                this.setState({
                    email_status: 'Pending'
                })
            }
        }
        else {
            Alert.alert('Error',
                responseJson.message,
                [{text: 'OK'}])
        }
    }

    mobiles=async()=>{
        let responseJsonMobile = await SettingsService.getAllMobiles()
        if (responseJsonMobile.status === 'success') {
            const data = responseJsonMobile.data
            if (data.length == 0) {
                this.setState({
                    mobile_number_status: 'Incomplete'
                })
            } else {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].verified) {
                        this.setState({
                            mobile_number_status: 'Verified'
                        })
                    }
                }
                if (this.state.mobile_number_status != 'Verified') {
                    this.setState({
                        mobile_number_status: 'Pending'
                    })
                }
            }
        }else {
            Alert.alert('Error',
                responseJsonMobile.message,
                [{text: 'OK'}])
        }
    }

    addresses=async()=>{
        let responseJsonAddress = await UserInfoService.getAddress()
        if (responseJsonAddress.status === 'success') {
            const data = responseJsonAddress.data
            this.setState({
                address: data.line_1 + ',' + data.line_2 + ',' + data.city + ',' + data.state_province + ',' + data.country + ',' + data.postal_code,
                address_status: data.status
            })
        }else {
            Alert.alert('Error',
                responseJsonAddress.message,
                [{text: 'OK'}])
        }
    }


    documents=async()=>{
        let responseJsonDocuments = await UserInfoService.getAllDocuments()

        let id_verified = 0, id_pending = 0, a_id_verified = 0, a_id_pending = 0, address_verified=0,address_pending=0, address_denied = 0;
        if (responseJsonDocuments.status === 'success') {
            const data = responseJsonDocuments.data.results
            for (let i = 0; i < data.length; i++) {
                if (data[i].document_category === "Proof Of Identity" && data[i].status == 'verified') {
                    id_verified=id_verified+1
                }
                if (data[i].document_category === "Proof Of Identity" && data[i].status == 'pending') {
                    id_pending=id_pending+1
                }
                if (data[i].document_category === "Advanced Proof Of Identity" && data[i].status == 'verified') {
                    a_id_verified=a_id_verified+1
                }
                if (data[i].document_category === "Advanced Proof Of Identity" && data[i].status == 'pending') {
                    a_id_pending=a_id_pending+1
                }
                if (data[i].document_category === "Proof Of Address" && data[i].status == 'verified') {
                    address_verified=address_verified+1
                }
                if (data[i].document_category === "Proof Of Address" && data[i].status == 'pending') {
                    address_pending=address_pending+1
                }

            }


            if(id_verified>0){
                this.setState({
                    proof_of_identity_status:'verified'
                })
            }else if(id_pending>0){
                this.setState({
                    proof_of_identity_status:'pending'
                })
            }else{
                this.setState({
                    proof_of_identity_status:'incomplete'
                })
            }
            if(a_id_verified>0){
                this.setState({
                    advence_proof_of_identity_status:'verified'
                })
            }else if(a_id_pending>0){
                this.setState({
                    advance_proof_of_identity_status:'pending'
                })
            }else{
                this.setState({
                    advance_proof_of_identity_status:'incomplete'
                })
            }

            if(address_verified>0){
                this.setState({
                    proof_of_address_status:'verified'
                })
            }else if(address_pending>0){
                this.setState({
                    proof_of_address_status:'pending'
                })
            }else if(address_denied>0){
                this.setState({
                    proof_of_address_status:'denied'
                })
            }else{
                this.setState({
                    proof_of_address_status:'incomplete'
                })
            }
        }else {
            Alert.alert('Error',
                responseJsonDocuments.message,
                [{text: 'OK'}])
        }
    }


    render() {
        return (
            <View style={styles.container}>
                <Header
                    navigation={this.props.navigation}
                    drawer
                    homeRight
                    title="Get verified"
                />
                <View style={{flex: 1, paddingTop: 10}}>
                    <Option title="Email" subtitle={this.state.email}
                            buttonText={this.state.email_status.toUpperCase()}
                            gotoAddress="SettingsEmailAddresses" goTo={this.goTo}/>

                    <Option title="Mobile" subtitle={this.state.mobile_number}
                            buttonText={this.state.mobile_number_status.toUpperCase()}
                            gotoAddress="SettingsMobileNumbers" goTo={this.goTo}/>

                    <Option title="Basic Info" subtitle={this.state.basic_info}
                            buttonText={this.state.basic_info_status.toUpperCase()}
                            gotoAddress="SettingsPersonalDetails" goTo={this.goTo}/>

                    <Option title="Address" subtitle={this.state.address}
                            buttonText={this.state.address_status.toUpperCase()}
                            gotoAddress="SettingsAddress" goTo={this.goTo}/>

                    <Option title="Proof of Identity" subtitle="Waiting for approval"
                            buttonText={this.state.proof_of_identity_status.toUpperCase()}
                            gotoAddress="Document" goTo={this.goTo}/>

                    <Option title="Advanced Proof of Identity" subtitle="Waiting for approval"
                            buttonText={this.state.advance_proof_of_identity_status.toUpperCase()}
                            gotoAddress="Document" goTo={this.goTo}/>

                    <Option title="Proof of Address" subtitle="Waiting for approval"
                            buttonText={this.state.proof_of_address_status.toUpperCase()}
                            gotoAddress="Document" goTo={this.goTo}/>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
})
