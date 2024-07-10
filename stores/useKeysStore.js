import {ECPairFactory} from "ecpair";
import {BIP32Factory} from "bip32"
const secp256k1=require('tiny-secp256k1');
const bip39=require('bip39');
const bitcoin = require('bitcoinjs-lib');
export const useKeysStore=defineStore('keyManager', ()=>{
    const ecc=new ECPairFactory(secp256k1)
    const bip32=new BIP32Factory(secp256k1)
    let entropy=ref(localStorage.getItem('entropy'))
    let root=ref(null)
    let account=ref(null)
    if(entropy.value){
        root.value=bip32.fromSeed(bip39.mnemonicToSeedSync(bip39.entropyToMnemonic(entropy.value)))
        account.value=root.value.derivePath("m/84'/0'/0'")
    }

    function setEntropy(newEntropy){
        entropy.value=newEntropy
        localStorage.setItem('entropy',newEntropy)
        root.value=bip32.fromSeed(bip39.mnemonicToSeedSync(bip39.entropyToMnemonic(newEntropy)))
        account.value=root.value.derivePath("m/84'/0'/0'")
    }
    function logout(){
        entropy.value=null
        localStorage.setItem('entropy',null)
        root.value=null
        account.value=null
    }
    function getAddress(type, index, external=0){

        const { address } = bitcoin.payments[type]({ pubkey: account.value.derive(external).derive(index).publicKey });
        return address
    }
    function signPSBT(psbtBase64, index, external = 0) {
        // Parse the PSBT
        const psbt = bitcoin.Psbt.fromBase64(psbtBase64);
        
        // Derive the key pair for signing
        const keyPair = account.value.derive(external).derive(index);
        
        // Sign the inputs
        psbt.signAllInputs(keyPair);
        
        // Finalize the inputs
        psbt.finalizeAllInputs();
        
        // Return the fully signed transaction in hex format
        return psbt.extractTransaction().toHex();
    }
    return {
        entropy,
        setEntropy,
        getAddress,
        signPSBT,
        account,
        logout
    }
})