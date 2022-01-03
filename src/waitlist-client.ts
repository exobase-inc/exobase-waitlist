import axios from 'axios'
import config from './config'


type NetworkWaitlistStatus = {
  current_priority: number
  referral_link: string
  registered_email: string
  total_users: number
  total_referrals: number
  user_id: string
}

export type WaitlistStatus = {
  currentPriority: number
  referralLink: string
  registeredEmail: string
  totalUsers: number
  totalReferrals: number
  userId: string
  referralCode: string
}

const toWaitlistStatus = (data: NetworkWaitlistStatus): WaitlistStatus => ({
  currentPriority: data.current_priority,
  referralLink: `https://exobase.cloud/#waitlist?wrc=${data.referral_link.match(/ref_id=(.+)/)?.[1] ?? ''}`,
  registeredEmail: data.registered_email,
  totalUsers: data.total_users,
  totalReferrals: data.total_referrals,
  userId: data.user_id,
  referralCode: data.referral_link.match(/ref_id=(.+)/)?.[1] ?? ''
})

export const submit = async ({
  email,
  referralCode
}: {
  email: string
  referralCode?: string
}) => {
  const result = await axios.post(`https://getwaitlist.com/api/v1/waitlists/submit`, {
    api_key: config.waitlistKey,
    email,
    referral_link: `https://exobase.cloud?&ref_id=${referralCode}`
  })
  return toWaitlistStatus(result.data as NetworkWaitlistStatus)
}

export const lookup = async ({
  email
}: {
  email: string
}) => {
  const result = await axios.post(`https://getwaitlist.com/api/v1/users/status`, {
    api_key: config.waitlistKey,
    email
  })
  return toWaitlistStatus(result.data as NetworkWaitlistStatus)
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  submit,
  lookup
}