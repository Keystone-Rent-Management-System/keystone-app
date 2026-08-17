/**
 * ChecklistRoom — the collection form is capability-gated.
 *
 * The move-in room log was removed outright when it captured evidence
 * into nowhere (photos never stored, save never sent). It came back for
 * the DEMO journey, which promises `conditionRecords` — so the guarantee
 * to lock down is now behavioural, not textual:
 *
 *   · capability OFF (every real build until BE §T8): the screen renders
 *     the keep-your-own-photos guidance and NO collection controls;
 *   · demo mode (__DEV__ + Fixtures): the full form renders.
 *
 * The companion source assertion in noFalseSuccess.test.js pins the gate
 * to an early return; this file proves what each side of it renders.
 */
const React = require('react');
const renderer = require('react-test-renderer');

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
  SafeAreaProvider: ({children}) => children,
  SafeAreaView: ({children}) => children,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn(), goBack: jest.fn()}),
  useRoute: () => ({
    params: {
      room: {id: 'c5', room: 'Floors / windows'},
      progress: {done: 4, total: 6},
    },
  }),
  useIsFocused: () => true,
}));

const {useDataSourceStore} = require('../src/provider/store/devDataSource');
const ChecklistRoom = require('../src/screens/tenant_home/ChecklistRoom').default;

const collectText = json => {
  const texts = [];
  const walk = node => {
    if (node == null) return;
    if (typeof node === 'string') return texts.push(node);
    if (Array.isArray(node)) return node.forEach(walk);
    if (node.children) node.children.forEach(walk);
  };
  walk(json);
  return texts.join(' ').replace(/\s+/g, ' ');
};

const renderScreen = () => {
  let tree;
  renderer.act(() => {
    tree = renderer.create(React.createElement(ChecklistRoom));
  });
  return tree;
};

afterEach(() => {
  useDataSourceStore.getState().setSource('live');
});

describe('capability off — the shipped default', () => {
  it('renders guidance and no collection controls', () => {
    const text = collectText(renderScreen().toJSON());
    // The honest path: hold your own evidence.
    expect(text).toMatch(/own camera/i);
    expect(text).toMatch(/Not available yet/);
    // No condition picker, no save — the funnel must not exist.
    expect(text).not.toMatch(/\bGood\b/);
    expect(text).not.toMatch(/Save room/);
    expect(text).not.toMatch(/Note · optional/);
  });
});

describe('demo mode — __DEV__ + Fixtures', () => {
  it('renders the full logging form', () => {
    useDataSourceStore.getState().setSource('mock');
    const text = collectText(renderScreen().toJSON());
    expect(text).toMatch(/\bGood\b/);
    expect(text).toMatch(/\bFair\b/);
    expect(text).toMatch(/\bPoor\b/);
    // Progress counts THIS room as the next one done.
    expect(text).toMatch(/Save room — 5 of 6 done/);
    expect(text).toMatch(/Note · optional/);
    // And the demo form must not show the capability-off apology.
    expect(text).not.toMatch(/Not available yet/);
  });
});
