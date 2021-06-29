const Swal = require('sweetalert2');
const blockingLoader = require('../../js/blocking-loader');
import 'intl-tel-input/build/css/intlTelInput.css';
import intlTelInput from 'intl-tel-input';


module.exports.show = async () => {

    let iti;

    return await Swal.fire({
        title: 'Registration',
        html: `<form id="new-user-form">
        <p>Are you a person or a business?</p>
      <input type="radio" id="personal-user" name="type" value="individual" checked>
      <label for="personal-user">Person</label>
      <input type="radio" id="company-user" name="type" value="company">
      <label for="company-user">Business</label>
      <hr />
      
      <input type="email" id="contact-email" class="swal2-input" name="email" placeholder="email">
      <label class="form-error" data-error="email"></label>
      
      <input type="password" id="user-password" class="swal2-input" name="password" placeholder="password">
      <label class="form-error" data-error="password"></label>
      <input type="password" id="user-repeat-password" class="swal2-input" name="repeatPassword" placeholder="confirm password">
      <label class="form-error" data-error="repeatPassword"></label>


      
      <input type="text" id="user-phone-number" name="phone-number" class="swal2-input" placeholder="Phone number">
      <label class="form-error" data-error="phoneNumber"></label>
      

      
      <div id="user-individual-data">
        <input type="text" name="firstname" class="swal2-input" placeholder="First name">
        <label class="form-error" data-error="firstname"></label>
      
        <input type="text" name="surname" class="swal2-input" placeholder="Surname">
        <label class="form-error" data-error="surname"></label>
        
        <input type="date" name="birthday" id="user-birthday" class="swal2-input" placeholder="Birthday&nbsp;">
        <label class="form-error" data-error="birthday"></label>
        
      </div>
      
      <div id="user-company-data">
        <input type="text" name="companyName" class="swal2-input" placeholder="Company name">
        <label class="form-error" data-error="contact.companyName"></label>
      </div>
      
      <input type="text" name="w-address" class="swal2-input" placeholder="Address">
      <label class="form-error" data-error="address"></label>
      
      <input type="text" name="w-city" class="swal2-input" placeholder="City">
      <label class="form-error" data-error="city"></label>
      
      <select name="w-country" class="swal2-input">
          <option value="" disabled selected>Country</option>
          <option value="IT">Italy</option>
          <option value="DE">Germany</option>
          <option value="ES">Spain</option>
          <option value="FR">France</option>
          <option value="LU">Luxemburg</option>
          <option value="PT">Portugal</option>
          <option value="IE">Ireland</option>
      </select>
      <label class="form-error" data-error="country"></label>
      
      
      
      </form>
    `,
        confirmButtonText: 'Save Wallet',
        focusConfirm: false,
        didRender: () => {

            iti = intlTelInput(Swal.getPopup().querySelector("#user-phone-number"), {
                onlyCountries: ['DE', 'ES', 'IT', 'FR', 'IE', 'PT', 'LU'],
                separateDialCode: true
            });

            const individualDataBlock = Swal.getPopup().querySelector('#user-individual-data');
            const companyDataBlock = Swal.getPopup().querySelector('#user-company-data');

            companyDataBlock.style.display = 'none';

            const radios = Swal.getPopup().querySelectorAll('input[type=radio][name="type"]');


            Array.prototype.forEach.call(radios, function (radio) {
                radio.addEventListener('change', function (event) {
                    if (this.value === 'individual') {
                        individualDataBlock.style.display = 'block';
                        companyDataBlock.style.display = 'none';
                    } else if (this.value === 'company') {
                        individualDataBlock.style.display = 'none';
                        companyDataBlock.style.display = 'block';
                    }
                });
            });

            Swal.getPopup().querySelector('#user-birthday').addEventListener('change', function () {
                this.className=(this.value!=''?'swal2-input has-value':'');
            });

        },
        preConfirm: async () => {

            blockingLoader.show();

            const formData = new FormData(Swal.getPopup().querySelector('#new-user-form'));

            const payload = {
                password: formData.get('password'),
                repeatPassword: formData.get('repeatPassword'),
                entityType: formData.get('type'),
                firstname: formData.get('firstname') ? formData.get('firstname') : null,
                surname: formData.get('surname') ? formData.get('surname') : null,
                companyName: formData.get('companyName') ? formData.get('companyName') : null,
                email: formData.get('email'),
                phoneNumber: Swal.getPopup().querySelector(".iti__selected-dial-code").innerText + String(formData.get('phone-number')),
                country: formData.get('w-country'),
                address: formData.get('w-address'),
                city: formData.get('w-city'),
                birthday: formData.get('birthday'),
            };

            Swal.getPopup()
                .querySelectorAll("[data-error]")
                .forEach(errEl => errEl.innerText = "")

            let response;

            try {
                response = await apiClient.Users.create(payload).execute();

                blockingLoader.hide();
                return response.data;
            } catch (error) {

                if (error.code === 400) {
                    Swal.getPopup()
                        .querySelectorAll("[data-error]")
                        .forEach(errEl => errEl.innerText = error.data[errEl.getAttribute('data-error')] || "")
                }

                blockingLoader.hide();

                return false;
            }


        }
    });


};
