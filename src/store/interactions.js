import Web3 from 'web3'
import {ETHER_ADDRESS} from '../helpers'
import{
    web3Loaded,
    web3AccountLoaded,
    tokenLoaded,
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded,
    orderCancelling,
    orderCancelled,
    orderFilling,
    orderFilled,
    etherBalanceLoaded,
    tokenBalanceLoaded,
    exchangeEtherBalanceLoaded,
    exchangeTokenBalanceLoaded,
    balancesLoaded,
    balancesLoading
}from './actions'

import Token from '../abis/Token.json'
import Exchange from '../abis/Exchange.json'

export const loadWeb3 = (dispatch)=>{
    const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545');
    dispatch(web3Loaded(web3))
    return web3
}

export const loadAccount = async (web3, dispatch)=>{
    //await ethereum.enable()
    const accounts = await web3.eth.getAccounts()
    const account = accounts[0]
    console.log("Account", account)
    dispatch(web3AccountLoaded(account) )
    return account
}

export const loadToken = async (web3, networkId, dispatch)=>{
    try{
        const token = web3.eth.Contract(Token.abi, Token.networks[networkId].address)
        dispatch(tokenLoaded(token))
        return token
    }catch(error){
        console.log('Contract not deployed to current network. Please select aother network with Metamask')
        return null
    }
}

export const loadExchange = async (web3, networkId, dispatch)=>{
    try{
        const exchange = web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address)
        dispatch(exchangeLoaded(exchange))
        return exchange
    }catch(error){
        console.log('Exchange not deployed to current network. Please select aother network with Metamask')
        return null
    }
}

export const loadAllOrders = async(exchange, dispatch) =>{
    //1--Fetch cancelled orders with 'Cancel' event stream
    const cancelStream = await exchange.getPastEvents('Cancel', {fromBlock: 0, toBlock: 'latest'})
    //Format cancelled orders
    const cancelledOrders = cancelStream.map((event) => event.returnValues)
    //Add cancelled order to redux store
    dispatch(cancelledOrdersLoaded(cancelledOrders))

    //2--Fetch filled orders with 'Trade' event stream
    const tradeStream = await exchange.getPastEvents('Trade', {fromBlock: 0, toBlock: 'latest'})
    //Format traded orders 
    const filledOrders = tradeStream.map((event)=> event.returnValues)
    //Add traded orders to redux store
    dispatch(filledOrdersLoaded(filledOrders))
    
    //3--Fetch all orders with the 'Order' event stream
    const orderStream = await exchange.getPastEvents('Order', {fromBlock: 0, toBlock: 'latest'})
    //Format traded orders 
    const allOrders = orderStream.map((event)=> event.returnValues)
    //Add traded orders to redux store
    dispatch(allOrdersLoaded(allOrders))
}
//Cancelling Orders
export const cancelOrder = (dispatch, exchange, order, account) => {
    exchange.methods.cancelOrder(order.id).send({ from: account })
    .on('transactionHash', (hash) =>{
        dispatch(orderCancelling())
    })

    .on('error', (error) =>{
        console.log(error)
        window.alert('There was an error!')
    })
}

//Reload component by updating state whenever contract method called
export const subscribeToEvents = async(exchange, dispatch) => {
    exchange.events.Cancel({}, (error, event) =>{
        dispatch(orderCancelled(event.returnValues))
    })
    //orderFilled -> _trade -> Trade Event
    exchange.events.Trade({}, (error, event) =>{
        dispatch(orderFilled(event.returnValues))
    })

    exchange.events.Deposit({}, (error, event)=>{
        dispatch(balancesLoaded())
    })

    exchange.events.Withdraw({}, (error, event)=>{
        dispatch(balancesLoaded())
    })
}

//Filling Orders
export const fillOrder = (dispatch, exchange, order, account) => {
    exchange.methods.fillOrder(order.id).send({ from: account })
    .on('transactionHash', (hash) =>{
        dispatch(orderFilling())
    })

    .on('error', (error) =>{
        console.log(error)
        window.alert('There was an error!')
    })
}

//DEPOSITS
export const loadBalances = async (dispatch, web3, exchange, token, account) => {
    // Ether balance in wallet
    const etherBalance = await web3.eth.getBalance(account)
    dispatch(etherBalanceLoaded(etherBalance))
  
    // Token balance in wallet
    const tokenBalance = await token.methods.balanceOf(account).call()
    dispatch(tokenBalanceLoaded(tokenBalance))
  
    // Ether balance in exchange
    const exchangeEtherBalance = await exchange.methods.balanceOf(ETHER_ADDRESS, account).call()
    console.log('exchangeBalance', exchangeEtherBalance)
    dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance))
  
    // Token balance in exchange
    const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call()
    dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance))
  
    // Trigger all balances loaded
    dispatch(balancesLoaded())
  }

  export const depositEther = (dispatch, exchange, web3, amount, account) =>{
    exchange.methods.depositEther.send({from: account, value: web3.utils.toWei(amount, 'ether')})
    .on('transactionHash', (hash) =>{
        dispatch(balancesLoading())
    })

    .on('error', (error) =>{
        console.log(error)
        window.alert('There was an error!')
    })
  }

  export const withdrawEther = (dispatch, exchange, web3, amount, account) =>{
    exchange.methods.withdrawEther(web3.utils.toWei(amount, 'ether')).send({from: account})
    .on('transactionHash', (hash) =>{
        dispatch(balancesLoading())
    })

    .on('error', (error) =>{
        console.log(error)
        window.alert('There was an error!')
    })
  } 
  //Depositing tokens = approve + deposit
  export const depositToken = (dispatch, exchange, web3, token, amount, account) => {
    amount = web3.utils.toWei(amount, 'ether')
    
    token.methods.approve(exchange.options.address, amount).send({ from: account })
    .on('transactionHash', (hash) => {
      exchange.methods.depositToken(token.options.address, amount).send({ from: account })
      .on('transactionHash', (hash) => {
        dispatch(balancesLoading())
      })
      .on('error',(error) => {
        console.error(error)
        window.alert(`There was an error!`)
      })
    })
  }
  
  export const withdrawToken = (dispatch, exchange, web3, token, amount, account) => {
    exchange.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether')).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error',(error) => {
      console.error(error)
      window.alert(`There was an error!`)
    })
  }
  