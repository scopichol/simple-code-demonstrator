/**
 * "Rules of Optimization:
 *     Rule 1: Don't do it.
 *     Rule 2 (for experts only): Don't do it yet.”
 *
 * ~ Michael A. Jackson
 */

(function () {
    require.config({
        baseUrl: 'js',
        paths: {
            jquery: 'vendor/jquery/jquery.min',
            nem: 'vendor/nem/nem-sdk'
        }
    });

    require(['jquery','nem'], function ($) {
        $.noConflict();
        var nem = require("nem-sdk").default;
        var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);

        $('#button_01').click(function () {
            var walletName = $('#input_login').val()
            var password = $('#input_pwd').val()
            // Create PRNG wallet
            var wallet = nem.model.wallet.createPRNG(walletName, password, nem.model.network.data.testnet.id);
            
            // Convert stringified wallet object to word array
            var wordArray = nem.crypto.js.enc.Utf8.parse(JSON.stringify(wallet));
            
            // Word array to base64
            var base64 = nem.crypto.js.enc.Base64.stringify(wordArray);
            
            $('#textarea_01').val('Wallet name: '+walletName+'\nPassword: '+password+'\nWallet:\n'+base64);
            $('#textarea_wallet').val(base64);
            $('#input_addr').val(wallet.accounts['0'].address);
        });
        
        $('#button_02').click(function () {
            var privateKey = "2470537b32df9f09c5a78ef1504ef3b27176a09da1c84ff59446c66c5fd72816";
            var recipient = "TBTPDJDR3ZMHMMIKUXPXJTQICBX3IFRRSV6PVFBE";
            var amount = 1;
            var message = "dev guide test transaction";
            
            //~ var endpoint = nem.model.objects.create("endpoint")(nisURL, nisPort);
            var common = nem.model.objects.get("common");
            common.privateKey = privateKey;
            var transferTransaction = nem.model.objects.create("transferTransaction")(recipient, amount, message);
            var transactionEntity = nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, nem.model.network.data.testnet.id)
            console.log(transactionEntity);
            nem.model.transactions.send(common, transactionEntity, endpoint).then(function(res) {console.log("done");console.log(res);});
            
        });
        
        $('#button_showwallet').click(function () {
            var password = $('#input_pwd2').val();
            // Create Brain wallet
            var base64 =  $('#textarea_wallet').val();
            var decArray = nem.crypto.js.enc.Base64.parse(base64);
            var strWallet = nem.crypto.js.enc.Utf8.stringify(decArray);
            var wallet = JSON.parse(strWallet);
            // Create a common object
            var common = nem.model.objects.create("common")(password, "");
            
            // Get the wallet account to decrypt
            var walletAccount = wallet.accounts['0'];
            
            // Decrypt account private key
            $('#input_addr').val(walletAccount.address);
            
            try {
                nem.crypto.helpers.passwordToPrivatekey(common, walletAccount, walletAccount.algo);
                var keyPair = nem.crypto.keyPair.create(common.privateKey);
                $('#wallet_detail').val('Wallet name: '+wallet.name+'\nAddress: '+walletAccount.address+'\nPrivate key: '+common.privateKey+'\nPublic Key: '+keyPair.publicKey.toString());
            } catch(err) {
                $('#wallet_detail').val('Wallet name: '+wallet.name+'\nAddress: '+walletAccount.address+'\nBAD PASSWORD');
            }
        });

    });
}).call(this);
