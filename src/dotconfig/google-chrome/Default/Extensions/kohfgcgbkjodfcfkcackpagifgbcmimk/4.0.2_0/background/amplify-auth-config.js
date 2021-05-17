const region = 'us-east-1'
const amplifyConfig = {
  Auth: {
    region,
    identityPoolId: 'us-east-1:bae5c41f-cb27-4ac6-9ac1-05977f7812d0',
    userPoolId: 'us-east-1_cIskjGoJg',
    userPoolWebClientId: '2o2ltcq8tnme2fidk35frk2kt4'
  }
}
amplify.Auth.configure(amplifyConfig.Auth)
