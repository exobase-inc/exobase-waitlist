/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'radash'
import { useState, useEffect } from 'react'
import qsutil from 'query-string'
import { ArgumentTypes } from '../types'
import {
  toaster,
  Pane,
  Text,
  Heading,
  majorScale,
  Card,
  Button,
  Strong,
  Paragraph,
  Link,
  IconButton,
  TextInput
} from 'evergreen-ui'
import { BiCopy } from 'react-icons/bi'
import { SiTwitter } from 'react-icons/si'
import { IoIosRocket } from 'react-icons/io'
import { HiArrowRight } from 'react-icons/hi'
import waitlistClient, { WaitlistStatus } from '../waitlist-client'
import { useAjax, useSizeObservation } from '../hooks'
import { Split, Stack, Center } from './layout'
import theme from '../styles'
import styled from 'styled-components'
import Logo from './ui/Logo'


type Page = 'join' | 'join-loading' | 'overview'

export default function WaitlistScene() {

  const [page, setPage] = useState<Page>('join')
  const [waitlist, setWaitlist] = useState<WaitlistStatus | null>(null)
  const submitRequest = useAjax(waitlistClient.submit)

  useEffect(() => {
    const qs = qsutil.parse(window.location.search)
    if (!qs.email) {
      setPage('join')
      return
    }
    const email = qs.email as string
    const wrc = (qs.wrc ?? undefined) as undefined | string
    trySubmit(email, wrc)
  }, [])

  const trySubmit = async (email: string, wrc?: string) => {
    const [err, response] = await submitRequest.fetch({
      email,
      referralCode: wrc
    })
    if (err) {
      console.error(err)
      toaster.danger('There was a problem with the waitlist.Try going back to https://exobase.cloud')
      setPage('join')
      return
    }
    setPage('join-loading')
    setWaitlist(response)
  }

  if (page === 'join-loading') return (
    <JoinLoadingView
      onComplete={() => setPage('overview')}
    />
  )

  if (page === 'overview' && !!waitlist) return (
    <WaitlistView
      waitlist={waitlist}
    />
  )

  return (
    <JoinWaitlistView
      loading={submitRequest.loading}
      onSubmit={trySubmit}
    />
  )
}


const WaitlistView = ({
  waitlist
}: {
  waitlist: WaitlistStatus
}) => {

  return (
    <Split padding={majorScale(6)}>
      <WaitlistPositionGrid
        total={waitlist.totalUsers}
        position={waitlist.currentPriority}
      />
      <Pane marginLeft={majorScale(6)} flex={1}>
        <Split alignItems='bottom' marginBottom={majorScale(6)}>
          <Header flex={1} />
          <Stack alignItems='center'>
            <Text fontWeight='bold' size={600}>#{waitlist.currentPriority}</Text>
            <Text size={400}>your position</Text>
          </Stack>
        </Split>
        <Split>
          <Stack flex={1} maxWidth='50%'>
            <ShareCard referralLink={waitlist.referralLink} />
            <ExobaseAlphaCard marginTop={majorScale(6)} />
          </Stack>
          <Stack flex={1} marginLeft={majorScale(6)}>
            <GiphyEmbed />
          </Stack>
        </Split>
      </Pane>
    </Split>
  )
}

const JoinLoadingView = ({
  onComplete
}: {
  onComplete: () => void
}) => {
  return (
    <Center>
      <Pane maxWidth='800px' paddingY={majorScale(6)}>
        <Header marginBottom={majorScale(6)} />
        <WaitlistLoadingExperience
          onComplete={onComplete}
        />
      </Pane>
    </Center>
  )
}

const Header = (props: ArgumentTypes<typeof Split>[0]) => {
  return (
    <Split {...props}>
      <Logo width={40} />
      <Stack marginLeft={majorScale(2)}>
        <Heading fontWeight='bold' size={900} flex={1}>Exobase</Heading>
        <Text>The Waitlist</Text>
      </Stack>
    </Split>
  )
}

const JoinWaitlistView = ({
  loading = false,
  onSubmit
}: {
  loading?: boolean
  onSubmit?: (email: string) => void
}) => {
  return (
    <Center>
      <Pane maxWidth='800px' paddingY={majorScale(6)}>
        <Header marginBottom={majorScale(6)} />
        <JoinFormCard onSubmit={onSubmit} loading={loading} />
        <ExobaseAlphaCard marginTop={majorScale(6)} />
      </Pane>
    </Center>
  )
}

const ShareCard = ({
  referralLink
}: {
  referralLink: string
}) => {

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink ?? '')
    toaster.success('Copied to clipboard', {
      duration: 2
    })
  }

  const gotoTweet = () => {
    const twitterQs = qsutil.stringify({
      text: `I just joined the waitlist for @exobasecloud.`,
      url: referralLink,
      hashtags: 'ExobaseAlpha,AWS,GCP'
    })
    window.open(`https://twitter.com/intent/tweet?${twitterQs}`, '_blank', 'width=600,height=500')
  }
  return (
    <Card
      elevation={1}
      padding={majorScale(2)}
    >
      <Heading size={800} marginBottom={majorScale(1)}>Share The Joy</Heading>
      <Paragraph
        marginBottom={majorScale(2)}
        maxWidth={500}
        size={500}
      >
        When others sign up to the waitlist using your link you'll move up <Strong>5</Strong> spots on the list. The top 10 spots on launch day will enter the Exobase Alpha program.
      </Paragraph>
      <Split alignItems='center'>
        <Pane
          flex={1}
          border={`1px solid ${theme.colors.grey200}`}
          borderRadius={4}
          padding={majorScale(1)}
          backgroundColor={theme.colors.grey100}
        >
          <Link>{referralLink}</Link>
        </Pane>
        <IconButton
          marginLeft={majorScale(1)}
          onClick={copyToClipboard}
          appearance='minimal'
          icon={<BiCopy size={12} />}
        />
        <IconButton
          marginLeft={majorScale(1)}
          onClick={gotoTweet}
          appearance='primary'
          icon={<SiTwitter size={12} />}
        />
      </Split>
    </Card>
  )
}



const JoinFormCard = ({
  loading = false,
  onSubmit
}: {
  loading?: boolean
  onSubmit?: (email: string) => void
}) => {
  const [state, setState] = useState('')
  var isValid = /(.+)@(.+){2,}\.(.+){2,}/.test(state)
  return (
    <Card
      elevation={1}
      padding={majorScale(2)}
    >
      <Heading size={800} marginBottom={majorScale(1)}>Join The Waitlist</Heading>
      <Paragraph
        marginBottom={majorScale(2)}
        maxWidth={500}
        size={500}
      >
        We'll let you know when launch day is close. If your one of the first 10 on the waitlist you'll get our help building your product on the Exobase platform when we launch.
      </Paragraph>
      <Split alignItems='center'>
        <TextInput
          flex={1}
          placeholder="sunny@gmail.com"
          value={state}
          onChange={(e: any) => setState(e.target.value)}
        />
        <Button
          disabled={!isValid}
          onClick={() => onSubmit?.(state)}
          appearance='primary'
          marginLeft={majorScale(2)}
          isLoading={loading}
        >
          join
        </Button>
      </Split>
    </Card>
  )
}


const ExobaseAlphaCard = (props: ArgumentTypes<typeof Card>[0]) => {
  return (
    <Card
      {...props}
      elevation={1}
      padding={majorScale(2)}
      backgroundColor={theme.colors.accent}
    >
      <Split>
        <Pane flex={1}>
          <Heading
            size={800}
            color={theme.colors.white}
            marginBottom={majorScale(1)}
          >
            Exobase Alpha
          </Heading>
          <Paragraph
            color={theme.colors.white}
            maxWidth={500}
            size={500}
          >
            To thank our first users we're going to help them onboard to Exobase.
            We'll spend a week with each of the top 10 members of the waitlist doing whatever we can to get their projects running on Exobase quickly.
          </Paragraph>
        </Pane>
        <Stack
          paddingX={majorScale(2)}
          alignItems='center'
        >
          <IoIosRocket
            size={32}
            color={theme.colors.white}
          />
        </Stack>
      </Split>
      <Split marginTop={majorScale(3)}>
        <PointingLink
          href='https://docs.exobase.cloud'
          backgroundColor={theme.colors.white}
          padding={majorScale(1)}
        >
          <Split alignItems='center'>
            <Text color={theme.colors.accent} marginRight={majorScale(1)}>learn more</Text>
            <HiArrowRight color={theme.colors.accent} />
          </Split>
        </PointingLink>
      </Split>
    </Card>
  )
}

const PointingLink = styled(Link)`
  > div > span {
    transition: margin-right ease .3s;
  }
  &:hover > div > span {
    margin-right: ${majorScale(2)}px;
  }
` as typeof Link

const WaitlistPositionGrid = ({
  total,
  position
}: {
  total: number
  position: number
}) => {

  const grid = (() => {
    if (total < 50) return {
      total: 50,
      columns: 5,
      size: 30
    }
    if (total < 100) return {
      total: 100,
      columns: 10,
      size: 20
    }
    return {
      total: 500,
      columns: 20,
      size: 10
    }
  })()

  return (
    <Pane>
      <Pane
        display='grid'
        gridTemplateColumns={`repeat(${grid.columns}, 1fr)`}
        columnGap={grid.size}
        rowGap={grid.size}
      >
        {_.range(1, grid.total).map(idx => (
          <Pane
            borderRadius={4}
            height={grid.size}
            width={grid.size}
            key={idx}
            backgroundColor={(() => {
              if (idx === position) return 'gold'
              if (idx <= total) return theme.colors.accent
              return theme.colors.grey100
            })()}
          />
        ))}
      </Pane>
      <Center
        marginTop={majorScale(3)}
      >
        <Split
          alignItems='center'
        >
          <Text
            fontWeight='bold'
            marginRight={majorScale(1)}
          >
            This is the line. You are here:
          </Text>
          <Pane
            borderRadius={3}
            backgroundColor='gold'
            width={20}
            height={20}
          />
        </Split>
      </Center>
    </Pane>
  )
}


const GiphyEmbed = () => {
  const gifs = [
    'https://media3.giphy.com/media/fdyZ3qI0GVZC0/giphy.gif', // ron swanson
    'https://media3.giphy.com/media/g9582DNuQppxC/giphy.gif', // 
    'https://media3.giphy.com/media/d31w24psGYeekCZy/giphy.gif', // simon
    'https://media3.giphy.com/media/2fQ1Gq3KOpvNs4NTmu/giphy.gif', // gilfoyle
    'https://media3.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', // sponge bob
    'https://media3.giphy.com/media/mGK1g88HZRa2FlKGbz/giphy.gif' // friends
  ]
  const gif = gifs[_.random(0, gifs.length - 1)]
  const size = useSizeObservation()
  return (
    <Card
      ref={size.ref}
      height={size.width * .70}
      elevation={1}
      backgroundImage={`url('${gif}')`}
      backgroundSize='cover'
      backgroundRepeat='no-repeat'
      backgroundPosition='center center'
    />
  )
}

const useRotatingState = (args: {
  items: string[]
  interval: number
  onComplete?: () => void
}) => {
  const [item, setItem] = useState(args.items[0])
  console.log('item: ', item)
  const total = args.items.length
  const current = args.items.indexOf(item)
  useEffect(() => {
    const iid = setInterval(() => {
      console.log({ current, total })
      if (current === total) return
      console.log('setting to: ', {
        idx: current + 1,
        item: args.items[current + 1]
      })
      setItem(args.items[current + 1])
    }, args.interval)
    return () => {
      clearInterval(iid)
    }
  }, [])
  return item
}

const WaitlistLoadingExperience = ({
  onComplete,
  ...rest
}: {
  onComplete?: () => void
} & ArgumentTypes<typeof Card>[0]) => {
  const step = useRotatingState({
    interval: 750,
    onComplete,
    items: [
      'Beggining waitlist due diligence',
      'Scanning GitHub for evidence of activity as a Java developer',
      'Searching your social media for photos of pizza with pineapple on it',
      'Accessing security mainframe images to ensure you don\'t back into your parking spaces'
    ]
  })
  return (
    <Card
      {...rest}
      elevation={1}
      padding={majorScale(2)}
    >
      <Heading
        size={800}
        textAlign='center'
        marginBottom={majorScale(1)}
      >
        Verifying Access
      </Heading>
      <Paragraph
        maxWidth={500}
        size={500}
      >
        {step}
      </Paragraph>
    </Card>
  )
}
