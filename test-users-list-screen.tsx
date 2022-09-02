import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  TextInput
} from 'react-native';
import { Colors } from '../styles/colors';
import { styles } from '../styles/screens/test-users-list-screen-style';
import { HomeToolbarCMP } from '../components/home-toolbar-cmp';
import { ButtonCMP } from '../components/button-cmp';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DateAndTime } from '../helpers/date-helper';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { LoadingCMP } from '../components/loading-cmp';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TopSingleTabCMP } from '../components/top-single-tab-cmp';
import { getDailyTestUsers } from '../logic/daily-test-logic';
import { getRtpcrTestUsers } from '../logic/rtpcr-test-logic';
import { getAntigenTestUsers } from '../logic/antigen-test-logic';
import { UserModel } from '../models/user-model';
import { useIsFocused } from '@react-navigation/native';

export const TestUsersListScreen = ({
  usersList,
  medicData,
  searchCB,
  clickCB,
  onRefresh
}: {
  usersList: UserModel[],
  medicData: any,
  searchCB: () => {},
  clickCB: () => {},
  onRefresh: (v: boolean) => {}
}) => {

  const navigation = useNavigation();

  const isFocused = useIsFocused();

  const [refreshing, setRefreshing] = useState(false);

  const { localDate, localTime, localDateNormal, timezone } = DateAndTime();

  const selectColor = (number: number) => {
    const hue = number * 137.508;
    return `hsl(${hue},50%,75%)`;
  };


  const refresh = () => {
    onRefresh(true);
  };

  const UserListCMP = ({
    user
  }: {
    user: any
  }) => {
    return (
      <TouchableOpacity
        style={styles.user_container}
        onPress={() => clickCB(user ? user : '')}
      >
        <View style={[
          styles.user_image,
          {
            backgroundColor: selectColor(
              Math.floor(Math.random() * 999)
            ),
          }
        ]}>
          <Text style={styles.image_text}>
            {((user.firstName || "").charAt(0) || "").toUpperCase()} 
            {((user.lastName || "").charAt(0) || "").toUpperCase()}
          </Text>
        </View>
        <View style={{padding: 8}}></View>
        <Text style={styles.user_name}>
          {user.firstName} {user.lastName}
        </Text>
      </TouchableOpacity>
    )
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search"
        placeholderTextColor={Colors.generalGrey}
        keyboardType='default'
        onChangeText={searchCB}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
          />
        }
        contentContainerStyle={{paddingBottom: 20}}
        style={styles.list_container}
      >
        {usersList.length != 0 && usersList.map((u,i) => {
          return <UserListCMP key={i} user={u} />
        })}
      </ScrollView>
    </View>
  )
}
