import {get} from lodash
import { createSelector } from 'reselect'

//fetching account from state
const account = state => get(state, 'web3.account')
export const accountSelector =createSelector(account, a => a)