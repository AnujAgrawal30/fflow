window.$ = window.jQuery = require('./jquery.min');
require('bootstrap');

const Modal = require('../../app/js/modals/abstract');

Modal.Alert(
    "info",
    "Hi! and thank you for coming!. FFlow even tho fully functional, it is, for now, a fictional product created as a contender " +
    "for the first prize of the international hackathon formula 0001 organized by Rapyd. " +
    "Any reference to Rapyd intellectual material is used only as an example, and all user information collected during the life of this demo " +
    "will be wipe out after the hackathon is over. For now, please enjoy! (BTW you need an invitation code to access 😎)",

    "Disclaimer");