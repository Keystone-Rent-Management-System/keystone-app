import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StatusBar, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import {useQueryClient} from '@tanstack/react-query';

import {useOnboarding, onboardingQueryKey} from '../../hooks/useOnboarding';
import OnboardingServices from '../../services/OnboardingServices';
import {Screen} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {toast} from '../../utils/toast';
import {getError} from '../../utils/getError';

// The signing ceremony, IN the app.
//
// Live: BE mints a BoldSign EMBEDDED SIGNING LINK for this agreement +
// signer (POST /agreements/{id}/sign-session → {embeddedSignLink}) and
// the ceremony renders here in a WebView — no email hop, no browser.
// Completion is detected two ways, and neither is trusted as the source
// of truth: BoldSign's page events (forwarded via postMessage) and the
// redirect URL. Both only trigger a REFETCH — what the server says after
// its webhook processed is what the checklist renders. A hijacked
// redirect cannot fake a signed lease. Contract: BE_ASKS_MOBILE §T17.
//
// Demo (Fixtures): there is no BoldSign document to sign, so the WebView
// renders a local, clearly-labelled ceremony page instead. Signing it
// advances the demo state through the same service the old button used.

const BOLDSIGN_EVENTS = ['onDocumentSigned', 'onDocumentSigningCompleted'];
const SIGNED_REDIRECT = /keystonerent\.app\/(signed|esign-complete)/;

// Forward BoldSign's window messages into the RN layer. BoldSign's
// embedded page emits its lifecycle via window.postMessage.
const FORWARD_EVENTS = `
  window.addEventListener('message', function (e) {
    try {
      var d = typeof e.data === 'string' ? e.data : JSON.stringify(e.data);
      window.ReactNativeWebView.postMessage(d);
    } catch (err) {}
  });
  true;
`;

const demoCeremonyHtml = agreement => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{margin:0;font-family:-apple-system,Helvetica,sans-serif;background:#F4F2EC;color:#152535}
  .bar{background:#152535;color:#E7E5DA;padding:14px 16px;font-size:13px;letter-spacing:.4px}
  .bar b{color:#CDA000}
  .paper{background:#fff;margin:16px;border-radius:14px;padding:20px;box-shadow:0 1px 4px rgba(21,37,53,.08)}
  h1{font-size:19px;margin:0 0 4px}
  .muted{color:#5B6774;font-size:13px;line-height:1.5}
  .row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #EEE;font-size:14px}
  .row b{font-variant-numeric:tabular-nums}
  .consent{display:flex;gap:10px;align-items:flex-start;margin:18px 0 6px;font-size:13px;line-height:1.5}
  button{width:100%;padding:15px;border:0;border-radius:12px;background:#9aa3ad;color:#fff;font-size:16px;font-weight:600}
  button.ready{background:#152535}
</style></head><body>
<div class="bar">SIGNING CEREMONY · <b>DEMO — NOT A REAL SIGNATURE</b> · BoldSign arrives here</div>
<div class="paper">
  <h1>Residential lease — ${agreement.space}</h1>
  <p class="muted">${agreement.property} · Landlord: ${agreement.landlord}</p>
  <div class="row"><span>Monthly rent</span><b>$${agreement.monthlyRent}/mo</b></div>
  <div class="row"><span>Deposit</span><b>$${agreement.deposit}</b></div>
  <div class="row"><span>Term</span><b>${agreement.term}</b></div>
  <div class="row"><span>Liability</span><b>Your room only</b></div>
  <label class="consent">
    <input id="agree" type="checkbox" onchange="document.getElementById('sign').className=this.checked?'ready':''">
    <span>I have read the agreement and intend my electronic signature to be
    legally binding, per the ESIGN Act and UETA.</span>
  </label>
  <button id="sign" onclick="if(document.getElementById('agree').checked){window.ReactNativeWebView.postMessage('keystone-demo-signed')}">
    Sign agreement
  </button>
</div></body></html>`;

const AgreementSign = () => {
  const nav = useNavigation();
  const qc = useQueryClient();
  const {status} = useOnboarding();
  const agreement = status?.agreement;

  const [session, setSession] = useState({loading: true, link: null});
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await OnboardingServices.createSignSession(
          agreement?.agreementId,
        );
        if (alive) setSession({loading: false, link: s?.embeddedSignLink ?? null});
      } catch (err) {
        if (alive) {
          setSession({loading: false, link: null, error: getError(err)});
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [agreement?.agreementId]);

  const finish = async fromDemo => {
    if (finishing) return;
    setFinishing(true);
    try {
      if (fromDemo) {
        // Demo: the ceremony IS the signature; advance the journey.
        await OnboardingServices.signAgreement(agreement.agreementId);
      }
      // Live: the webhook already told the server. Either way the
      // checklist re-reads what the server (fixture) now says.
      await qc.invalidateQueries({queryKey: onboardingQueryKey});
      nav.navigate('onboarding__checklist');
    } catch (err) {
      setFinishing(false);
      toast.show(
        `We couldn’t record your signature — ${getError(err)}. The agreement is not signed.`,
        toast.LONG,
      );
    }
  };

  if (!agreement) {
    return (
      <Screen title="Sign agreement" back="Agreement">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <Text className="text-keystone_slate font-inter text-[15px] leading-6">
          Your agreement isn’t ready to sign yet.
        </Text>
      </Screen>
    );
  }

  if (session.loading || finishing) {
    return (
      <Screen title="Sign agreement" back="Agreement">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <View className="items-center justify-center" style={{paddingTop: 120}}>
          <ActivityIndicator color={COLORS.keystone_gold} />
          <Text className="text-keystone_slate font-inter text-[13px] mt-3">
            {finishing ? 'Recording your signature…' : 'Preparing your agreement…'}
          </Text>
        </View>
      </Screen>
    );
  }

  if (!session.link && session.error) {
    return (
      <Screen title="Sign agreement" back="Agreement">
        <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
        <Text className="text-keystone_slate font-inter text-[15px] leading-6">
          We couldn’t start the signing session — {session.error}. Go back and
          try again; nothing has been signed.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen title="Sign agreement" back="Agreement" contentStyle={{padding: 0}}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <WebView
        style={{flex: 1, minHeight: 560, backgroundColor: '#F4F2EC'}}
        originWhitelist={['*']}
        source={
          session.link
            ? {uri: session.link}
            : {html: demoCeremonyHtml(agreement)}
        }
        injectedJavaScript={session.link ? FORWARD_EVENTS : undefined}
        onMessage={e => {
          const msg = e?.nativeEvent?.data ?? '';
          if (msg === 'keystone-demo-signed') return finish(true);
          if (BOLDSIGN_EVENTS.some(ev => msg.includes(ev))) return finish(false);
        }}
        onNavigationStateChange={nav$ => {
          if (session.link && SIGNED_REDIRECT.test(nav$?.url ?? '')) {
            finish(false);
          }
        }}
      />
    </Screen>
  );
};

export default AgreementSign;
