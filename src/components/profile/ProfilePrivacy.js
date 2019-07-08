// @flow
import startCase from 'lodash/startCase'
import React, { useEffect, useState } from 'react'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import Icon from 'react-native-elements/src/icons/Icon'
import { RadioButton } from 'react-native-paper'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import { BackButton } from '../appNavigation/stackNavigation'
import { colors } from '../theme/styles'
import { CustomButton, CustomDialog, Text, Wrapper } from '../common'

const TITLE = 'PROFILE PRIVACY'
const log = logger.child({ from: 'ProfilePrivacy' })

// privacy options
const privacyOptions = ['private', 'masked', 'public']
const tips = {
  private: 'Nobody will be able to see your field, nor to find you searching by it.',
  masked: 'Your field will be partially visible (e.g.: ****ple@***.com). Nobody will be able to search you by it.',
  public: 'Your field is publicly available. Anybody will be able to find you by it.'
}

// fields to manage privacy of
const profileFields = ['mobile', 'email']
const initialState = profileFields.reduce((acc, field) => ({ ...acc, [`${field}`]: '' }), {})
const titles = { mobile: 'Phone number:', email: 'Email:' }

const ProfilePrivacy = props => {
  const [initialPrivacy, setInitialPrivacy] = useState(initialState)
  const [privacy, setPrivacy] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [showTips, setShowTips] = useState(false)

  useEffect(() => {
    // looks for the users fields' privacy
    const privacyGatherer = async () => {
      const toUpdate = profileFields.map(field => userStorage.getProfileField(field))
      const fields = await Promise.all(toUpdate)

      // set the current privacy values
      fields.map(({ privacy }, index) => {
        setInitialPrivacy(prevState => ({ ...prevState, [`${profileFields[index]}`]: privacy }))
        setPrivacy(prevState => ({ ...prevState, [`${profileFields[index]}`]: privacy }))
      })
    }

    privacyGatherer()
  }, [])

  /**
   * filters the fields to be updated
   */
  const updatableValues = () => profileFields.filter(field => privacy[field] !== initialPrivacy[field])

  const handleSave = async () => {
    setLoading(true)

    try {
      // filters out fields to be updated
      const toUpdate = updatableValues().map(field => ({
        update: userStorage.setProfileFieldPrivacy(field, privacy[field]),
        field
      }))

      // updates fields
      await Promise.all(toUpdate.map(({ update }) => update))

      // resets initial privacy states with currently set values
      toUpdate.map(({ field }) => setInitialPrivacy(prevState => ({ ...prevState, [`${field}`]: privacy[field] })))
    } catch (e) {
      log.error('Failed to save new privacy', { e })
    }

    setLoading(false)
  }

  return (
    <Wrapper>
      <View style={styles.mainContainer}>
        <View style={styles.growTwo}>
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>Manage your profile privacy</Text>
            <InfoIcon onPress={() => setShowTips(true)} />
          </View>

          <OptionsRow />

          <View>
            {profileFields.map(field => (
              <RadioButton.Group
                onValueChange={value => setPrivacy(prevState => ({ ...prevState, [`${field}`]: value }))}
                value={privacy[field]}
                key={field}
              >
                <OptionsRow title={titles[field]} />
              </RadioButton.Group>
            ))}
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <BackButton mode="text" screenProps={props.screenProps} style={styles.growOne}>
            Cancel
          </BackButton>
          <CustomButton
            onPress={handleSave}
            mode="contained"
            loading={loading}
            disabled={updatableValues().length === 0}
            style={styles.growThree}
          >
            Save
          </CustomButton>
        </View>
      </View>
      <CustomDialog visible={showTips} onDismiss={() => setShowTips(false)} title="TIPS" dismissText="Ok">
        {privacyOptions.map(field => (
          <View key={field} style={styles.dialogTipItem}>
            <Text style={styles.dialogTipItemTitle}>{startCase(field)}</Text>
            <Text>{tips[field]}</Text>
          </View>
        ))}
      </CustomDialog>
    </Wrapper>
  )
}

ProfilePrivacy.navigationOptions = {
  title: TITLE
}

const styles = StyleSheet.create({
  optionsRowContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: colors.lightGray,
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    padding: '10px'
  },
  growOne: { flexGrow: 1 },
  growTwo: { flexGrow: 2 },
  growThree: { flexGrow: 3 },
  optionsRowTitle: { width: '15%', alignItems: 'center' },
  mainContainer: { display: 'flex', flexDirection: 'column', height: '100%' },
  subtitleRow: { display: 'flow', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: '16%' },
  subtitle: { fontSize: normalize(18) },
  buttonsRow: { display: 'flex', flexDirection: 'row', alignItems: 'center', height: '8%', width: '96%' },
  dialogTipItem: { display: 'flex', flexOrientation: 'column', marginBottom: normalize(20) },
  dialogTipItemTitle: { fontWeight: 'bold', color: '#00afff', fontSize: normalize(18) }
})

/**
 * InfoIcon component
 * @param onPress
 * @returns {ReactNode}
 * @constructor
 */
const InfoIcon = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Icon size={24} color="blue" name="info" />
  </TouchableOpacity>
)

/**
 * OptionsRow component
 * @param title
 * @returns {React.Node}
 * @constructor
 */
const OptionsRow = ({ title = '' }) => (
  <View style={styles.optionsRowContainer}>
    <Text style={styles.growTwo}>{title}</Text>

    {privacyOptions.map(privacy => (
      <View style={styles.optionsRowTitle} key={privacy}>
        {title === '' ? <Text>{startCase(privacy)}</Text> : <RadioButton value={privacy} />}
      </View>
    ))}
  </View>
)

export default ProfilePrivacy
