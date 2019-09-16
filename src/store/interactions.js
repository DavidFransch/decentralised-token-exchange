import Web3 from 'web3'
import{
    web3Loaded,
    web3AccountLoaded,
    tokenLoaded,
    exchangeLoaded,
    cancelledOrdersLoaded,
    filledOrdersLoaded,
    allOrdersLoaded
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