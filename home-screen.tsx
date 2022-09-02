import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  RefreshControl,
  StyleSheet,
  Linking,
  ScrollView
} from 'react-native';
import { Colors } from '../styles/colors';
import { styles } from '../styles/screens/home-screen-style';
import { FeatureCMP } from '../components/feature-cmp';
import { DateAndTime, formatDate, formatNewsDate, IsSameDate, formatNewsDateToNormal } from '../helpers/date-helper';
import { useNavigation } from '@react-navigation/native';
import { getDailyTest } from '../logic/daily-test-logic';
import { getRtpcrTest } from '../logic/rtpcr-test-logic';
import { getAntigenTest } from '../logic/antigen-test-logic';
import { getAllNews } from '../logic/news-logic';
import { useIsFocused } from '@react-navigation/native';
import { QuestionAnswerModel, DailyTestModel } from "../models/daily-test-model"
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoadingCMP } from '../components/loading-cmp';
import { ServerErrorCMP } from '../components/server-error-cmp';
import { MainTestModel } from "../models/main-test-model"
import { NewsModel } from "../models/news-model"
import { NewsInfoCardCMP } from "../components/news-info-card-cmp"
import { EmptyIcon } from '../icons/empty-icon';

export const HomeScreen = ({
  navigation
}): {
  navigation: any
} => {

  const [refreshing, setRefreshing] = useState(false);

  const [news, setNews] = useState([]);

  const [dailyTest, setDailyTest] = useState({});
  const [rtpcrTest, setRtpcrTest] = useState({});
  const [antigenTest, setAntigenTest] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Please wait while we retrieve data.');

  const [isServerError, setIsServerError] = useState(false);
  const [serverText, setServerText] = useState('We encountered an error while retrieving data from server. Please refresh the page after some time. If the problem still persists, please contact admin. Thank you for your patience.');

  const { localDate, timezone } = DateAndTime();

  const nav = useNavigation();

  const isFocused = useIsFocused();

  const [userData, setUserData] = useState({});

  useEffect(() => {

    const getData = async () => {
      const json = await AsyncStorage.getItem('user');
      return json != null ? JSON.parse(json) : null;
    }

    getData().then(setUserData);

    return () => {
      setUserData({})
    }

  },[isFocused]);

  const getAllNewsList = async () => {

    try {

      setNews([]);

      const data = await getAllNews();

      if(data[0] instanceof NewsModel){

        let newsList = [];

        for(let n of data){

          const { compare } = IsSameDate(formatNewsDateToNormal(n.updatedAt), localDate);

          compare && newsList.push(n);

        };

        setNews(newsList);
      }

    } catch(err){

      console.log("err", err)
    };

  };

  const getTests = async () => {

    try {

      setIsLoading(true);

      setDailyTest({});
      setRtpcrTest({});
      setAntigenTest({});

      const json = await AsyncStorage.getItem('user');
      const user = json != null ? JSON.parse(json) : null;

      const daily = await getDailyTest({
        userMongoId: user._id,
        timezone: timezone
      });

      const rtpcr = await getRtpcrTest({
        userMongoId: user._id,
        timezone: timezone
      });

      const antigen = await getAntigenTest({
        userMongoId: user._id,
        timezone: timezone
      });

      daily instanceof DailyTestModel
        ? setDailyTest(daily)
        : setDailyTest({});

        rtpcr instanceof MainTestModel
          ? setRtpcrTest(rtpcr)
          : setRtpcrTest({})

          antigen instanceof MainTestModel
            ? setAntigenTest(antigen)
            : setAntigenTest({})

            setIsLoading(false);

            if(
              typeof daily == 'undefined'
            || typeof rtpcr == 'undefined'
            || typeof antigen == 'undefined'
            ) {

              setIsServerError(true);
            }

    } catch(err){

      setIsLoading(false);
      setIsServerError(true);

      console.log("err", err)
    }
  };

  useEffect(() => {
    getAllNewsList();
    getTests();

    return () => {
      setDailyTest({});
      setRtpcrTest({});
      setAntigenTest({});
      setNews([]);
      setUserData({});
      setIsLoading(false)
      setIsServerError(false);
    };

  },[isFocused]);

  const dailyTestNav = () => {

    dailyTest.q1
      ? navigation.navigate(
        'ResultScreen',
        {
          test: dailyTest,
          title: "Daily Test Report",
          testType: "daily"
        }
      )
        : navigation.navigate('DailyTestScreen')

  }

  const rtpcrTestNav = () => {

    navigation.navigate(
      'ResultScreen',
      {
        test: rtpcrTest,
        title: "RTPCR Test Report",
        testType: "rtpcr"
      }
    )

  }

  const antigenTestNav = () => {

    navigation.navigate(
      'ResultScreen',
      {
        test: antigenTest,
        title: "Antigen Test Report",
        testType: "antigen"
      }
    )

  }

  const onRefresh = () => {
    getAllNewsList();
    getTests();
  };

  const DashboardFeatureBlockCMP = ({
    headingTitle,
    bgColor,
    color,
    title,
    description,
    type
  }: {
    headingTitle: string,
    bgColor: string,
    color: string,
    title: string,
    description: string,
    type: string
  }) => {

    return (
      <>
        <View style={styles.feature_block}>
          <FeatureCMP
            type={type}
            bgColor={bgColor}
            color={color}
            title={title}
            description={description} />
        </View>
      </>
    )

  };

  return (
    <View style={styles.container}>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={{paddingBottom: 20}}
      >

        <View style={styles.heading_block}>
          <Text style={styles.heading_title}>
            Your Test Overview
          </Text>
          <Text 
            onPress={() => Linking.openURL('https://www.cdc.gov/screening/privacy-notice.html')}
            style={[styles.heading_title, styles.heading_guidelines]}>
            *As per CDC Guidelines
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => dailyTestNav()}
        >
          <DashboardFeatureBlockCMP
            headingTitle="Your Health Check"
            type="daily"
            bgColor={
              dailyTest.result == 'negative'
                ? Colors.lightGreen
                : dailyTest.result == 'positive' || dailyTest.result == 'maybepositive'
                  ? Colors.musturd
                  : Colors.orange
            }
            color="white"
            title="Daily Questionnaire"
            description={
              dailyTest.result == 'negative'
                ? 'You are cleared for the day.'
                : dailyTest.result == 'maybepositive'
                  ? 'You need to be tested for COVID-19 today.'
                  : dailyTest.result == 'positive'
                    ? `You tested POSITIVE. Please be quarentined till ${formatDate(dailyTest.resultValidTill)}`
                    :"You haven't answered today's questionnaire yet"

            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => rtpcrTestNav()}
        >
          <DashboardFeatureBlockCMP
            headingTitle="Your PCR Test Results"
            type="rtpcr"
            bgColor={
              rtpcrTest.result == 'negative'
                ? Colors.lightGreen
                : rtpcrTest.result == 'positive' || rtpcrTest.result == 'maybepositive'
                  ? Colors.musturd
                  : Colors.orange
            }
            color="white"
            title="RTPCR Test Report"
            description={
              rtpcrTest.result == 'negative'
                ? `You are cleared till ${formatDate(rtpcrTest.resultValidTill)}.`
                : rtpcrTest.result == 'maybepositive'
                  ? 'Please visit nearby medic to get tested for COVID-19.'
                  : rtpcrTest.result == 'positive'
                    ? `You tested POSITIVE. Please be quarentined till ${formatDate(rtpcrTest.resultValidTill)}`
                    :"You haven't enrolled for RTPCR test."

            }
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => antigenTestNav()}
        >
          <DashboardFeatureBlockCMP
            headingTitle="Your Antigen Test Results"
            type="antigen"
            bgColor={
              antigenTest.result == 'negative'
                ? Colors.lightGreen
                : antigenTest.result == 'positive' || antigenTest.result == 'maybepositive'
                  ? Colors.musturd
                  : Colors.orange
            }
            color="white"
            title="Antigen Test Report"
            description={
              antigenTest.result == 'negative'
                ? `You are cleared till ${formatDate(antigenTest.resultValidTill)}.`
                : antigenTest.result == 'maybepositive'
                  ? 'Please visit nearby medic to get tested for COVID-19.'
                  : antigenTest.result == 'positive'
                    ? `You tested POSITIVE. Please be quarentined till ${formatDate(antigenTest.resultValidTill)}`
                    :"You haven't enrolled for Antigen test."


            }
          />
        </TouchableOpacity>

        <View style={styles.heading_block}>
          <Text style={styles.heading_title}>
            Latest News and Alerts
          </Text>
        </View>
        <View style={{marginBottom: 10}}></View>

        {
          news.length == 0
            ? (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
                }}
              >
                <View style={{
                  width: 70,
                  height: 70
                  }}
                >
                  <EmptyIcon fill={Colors.dusk} />
                </View>
              </View>
            )
            : (
              news.map((n, i) => {
                return <TouchableOpacity
                  key={i}
                  onPress={() => navigation.navigate('NewsContentScreen', { state: { data: n }})}
                  style={{
                    marginLeft: 20,
                    marginRight: 20,
                    marginTop: 10,
                    marginBottom: 10
                  }}
                >
                  <NewsInfoCardCMP
                    title={n.title}
                    date={formatNewsDate(n.updatedAt)}
                  />
                </TouchableOpacity>
              })
            )
        }

      </ScrollView>

      {isLoading && <LoadingCMP message={loadingText}/>}
      {isServerError && <ServerErrorCMP message={serverText}/>}

    </View>
  );
};
