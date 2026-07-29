import React from 'react';
import {Activity} from './Receipts';

// Statement route — the same Activity screen (design 5e) opened on
// its statement segment. Both routes survive; the screens merged.
const Statements = () => <Activity initialMode="statement" />;

export default Statements;
