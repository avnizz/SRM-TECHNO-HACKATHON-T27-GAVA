const App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("OrderStorage.json", function(orderStorage) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.OrderStorage = TruffleContract(orderStorage);
      // Connect provider to interact with contract
      App.contracts.OrderStorage.setProvider(App.web3Provider);

      // Check if the contract is deployed
      App.checkOrderStorageDeployed();
    });
    return App.bindEvents();
  },

  checkOrderStorageDeployed: function() {
    App.contracts.OrderStorage.deployed().then(function(instance) {
      console.log("OrderStorage Contract Address:", instance.address);
    });
  },

  bindEvents: function() {
    $(document).on('click', '#add-order-btn', App.handleAddOrder);
    $(document).on('click', '#get-order-btn', App.handleGetOrder);
  },

  handleAddOrder: function(event) {
    event.preventDefault();

    var orderNumber = $('#order-number').val();
    var customerName = $('#customer-name').val();
    var totalPrice = $('#total-price').val();
    var imageHash = $('#image-hash').val();

    App.contracts.OrderStorage.deployed().then(function(instance) {
      return instance.addOrder(orderNumber, customerName, totalPrice, imageHash, { from: App.account });
    }).then(function(result) {
      console.log(result);
      $('#add-order-form')[0].reset();
      alert('Order added successfully!');
    }).catch(function(err) {
      console.error(err);
      alert('Error adding order!');
    });
  },

  handleGetOrder: function(event) {
    event.preventDefault();

    var orderNumber = $('#get-order-number').val();

    App.contracts.OrderStorage.deployed().then(function(instance) {
      return instance.getOrder(orderNumber);
    }).then(function(result) {
      console.log(result);
      $('#get-order-result').html('Customer Name: ' + result[1] + '<br>Total Price: ' + result[2] + '<br>Image Hash: ' + result[3]);
    }).catch(function(err) {
      console.error(err);
      alert('Error getting order!');
    });
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
