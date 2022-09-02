import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Button,
  ScrollView,
  Image,
  Text,
  TextInput,
  Linking,
  StyleSheet,
} from 'react-native';
import {Colors} from '../styles/colors';
import {styles} from '../styles/screens/daily-test-screen-style';
import {BackIcon} from '../icons/back-icon';
import { ToolbarCMP } from '../components/toolbar-cmp'
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {LoadingCMP} from '../components/loading-cmp';
import {DateAndTime} from '../helpers/date-helper';
import { ButtonCMP } from '../components/button-cmp';
import { DailyTestModel } from "../models/daily-test-model"
import { AddDailyTest } from "../logic/daily-test-logic"


export const DailyTestScreen = ({
  navigation
}: {
  navigation: any
}) => {

  const nav = useNavigation();

  const isFocused = useIsFocused();

  const {timezone} = DateAndTime();

  const [ q1, setQ1 ] = useState('');
  const [ q2, setQ2 ] = useState('');
  const [ q3, setQ3 ] = useState('');
  const [ q4, setQ4 ] = useState('');
  const [ q5, setQ5 ] = useState('');
  const [ q6, setQ6 ] = useState('');
  const [ q7, setQ7 ] = useState('');
  const [ q8, setQ8 ] = useState('');
  const [ q9, setQ9 ] = useState('');
  const [ q10, setQ10 ] = useState('');
  const [ q11, setQ11 ] = useState('');
  const [ userData, setUserData ] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Checking answers, please wait...');

  const onDailyButtonPress = async () => {

    setIsLoading(true);

    if(q1 == "" || q2 == "" || q3 == "" || q4 == "" || q5 == "" || q6 == "" || q7 == "" || q8 == "" || q9 == "" || q10 == "" || q11 == "") {
      setIsLoading(false);
      Toast.show("Please answer all questions!");
      return;
    }

    try {

      const json = await AsyncStorage.getItem('user');
      const user = json != null ? JSON.parse(json) : null;

      const dailyTest = new DailyTestModel(
        q1,
        q2,
        q3,
        q4,
        q5,
        q6,
        q7,
        q8,
        q9,
        q10,
        q11,
        timezone,
        "",
        "",
        "",
        "",
        user.userId,
        user._id,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "daily"
      );

      const data = await AddDailyTest({
        dailyTest: dailyTest
      });

      if(data instanceof DailyTestModel){

        setQ1('');
        setQ2('');
        setQ3('');
        setQ4('');
        setQ5('');
        setQ6('');
        setQ7('');
        setQ8('');
        setQ9('');
        setQ10('');
        setQ11('');

        setIsLoading(false);

        navigation.navigate(
          'ResultScreen',
          {
            test: data,
            title: "Daily Test Report"
          }
        )

      } else {
        setIsLoading(false);
        Toast.show(data);
      }

    } catch(err) {

    }
  };

  const RadioButtonContainer = ({value, isPressed}: {value: string, isPressed: string}) => {

    isPressed == 'yes' ? isPressed = 'Yes': isPressed == '' ? isPressed = '' : isPressed = 'No'
    return (
      <View style={styles.radio_button_container}>
        <View style={styles.rb_outer}>
          <View style={[styles.rb_inner, {backgroundColor: isPressed == value ? Colors.blue : Colors.white}]} />
        </View>
        <Text style={styles.rb_text}>{value}</Text>
      </View>
    )
  }

  const questionContainer = question => {
    const [isYes, setIsYes] = useState(false);
    const [isNo, setIsNo] = useState(false);

    return (
      <View
        style={{
          flex: 1,
          marginLeft: 20,
          marginRight: 20,
          marginTop: 40,
        }}>
        <Text style={styles.answer_question}>{question}</Text>
        <View style={styles.radio_container}>
          <TouchableOpacity
            onPress={() => {
              setIsYes(true);
              setIsNo(false);
            }}>
            <RadioButtonContainer value="Yes" isPressed={isYes} />
          </TouchableOpacity>
          <View style={styles.gap}></View>
          <TouchableOpacity
            onPress={() => {
              setIsYes(false);
              setIsNo(true);
            }}>
            <RadioButtonContainer value="No" isPressed={isNo} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <ToolbarCMP
        onBackClickCB={() => navigation.goBack()}
        nameOrTitle="Daily Questionnaire"
        isBack={true}
        fontSize={25}
        iconWidth={20}
        iconHeight={20}
      />
      <ScrollView style={{flex: 1}}>
        <View style={styles.container}>
          <View>
            <Text style={styles.main_question}>
              Health Symptom Screening Questionnaire
            </Text>
            <TouchableOpacity>
              <Text
                onPress={() => Linking.openURL('https://www.cdc.gov/screening/privacy-notice.html')}
                style={[styles.main_question,{ color: 'red', textDecorationLine: 'underline', justifyContent: 'center'}]}>
                as per CDC Notice on Self-Screening
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.question}>
            Have you in the past 24 hours experienced any of the following:
          </Text>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Cough
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ1('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q1}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ1('no')}}>
                <RadioButtonContainer value='No' isPressed={q1}/>
              </TouchableOpacity>
            </View>
          </View>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Temperature of at least 100.4°
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ2('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q2}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ2('no')}}>
                <RadioButtonContainer value='No' isPressed={q2}/>
              </TouchableOpacity>
            </View>
          </View>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Sore throat
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ3('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q3}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ3('no')}}>
                <RadioButtonContainer value='No' isPressed={q3}/>
              </TouchableOpacity>
            </View>
          </View>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Shortness of breath
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ4('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q4}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ4('no')}}>
                <RadioButtonContainer value='No' isPressed={q4}/>
              </TouchableOpacity>
            </View>
          </View>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Body aches
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ5('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q5}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ5('no')}}>
                <RadioButtonContainer value='No' isPressed={q5}/>
              </TouchableOpacity>
            </View>
          </View>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Chills
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ6('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q6}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ6('no')}}>
                <RadioButtonContainer value='No' isPressed={q6}/>
              </TouchableOpacity>
            </View>
          </View>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Sudden loss of sense of smell or taste without accompanying nasal stuffiness
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ7('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q7}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ7('no')}}>
                <RadioButtonContainer value='No' isPressed={q7}/>
              </TouchableOpacity>
            </View>
          </View>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Nausea, vomiting, diarrhea
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ8('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q8}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ8('no')}}>
                <RadioButtonContainer value='No' isPressed={q8}/>
              </TouchableOpacity>
            </View>
          </View>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Fatigue
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ9('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q9}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ9('no')}}>
                <RadioButtonContainer value='No' isPressed={q9}/>
              </TouchableOpacity>
            </View>
          </View>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Have you had contact with someone who has known or suspected COVID-19 infection
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ10('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q10}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ10('no')}}>
                <RadioButtonContainer value='No' isPressed={q10}/>
              </TouchableOpacity>
            </View>
          </View>
          <View 
            style={{
              flex:1,
              marginLeft: 20,
              marginRight: 20,
              marginTop: 40
            }}
          >
            <Text
              style={styles.answer_question}>
              Have you socialized with others who were not respecting social distance (6 feet) or who were not wearing face masks
            </Text>
            <View style={styles.radio_container}>
              <TouchableOpacity onPress={() => { setQ11('yes')}}>
                <RadioButtonContainer value='Yes' isPressed={q11}/>
              </TouchableOpacity>
              <View style={styles.gap}></View>
              <TouchableOpacity onPress={() => { setQ11('no')}}>
                <RadioButtonContainer value='No' isPressed={q11}/>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button_block}
            onPress={() => onDailyButtonPress()}
          >
            <ButtonCMP
              bgColor={Colors.lightGreen}
              textColor={Colors.white}
              title="Submit"
            />
          </TouchableOpacity>

        </View>
      </ScrollView>
      {isLoading && <LoadingCMP message={loadingText}/>}
    </View>
  );
};

