$(document).ready(function() {




    {
            $.ajax({
                type: "POST",
                url: "/register",
                data: $("#signup-form").serialize(),
                success: function(data){
                    
                    if(data){
                            var pwdregex= /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*+])[A-Za-z\d!@#$%^&*+]{6,}$/
                            var emailregex= /^([a-zA-Z0-9\.]+)@([a-zA-Z0-9])+(\.)([a-zA-Z0-9]+)$/

                            
                            //setting content for email
                            var emailSpan  = document.createElement("span");
                            emailSpan.style.visibility = "hidden";
                            

                            var email = document.getElementById("email");
                            email.parentNode.appendChild(emailSpan);
                            email.onfocus = function() {
                               emailSpan.innerHTML = "Email should be of the form prefix@domain_part1.domain_part2";
                               emailSpan.style.visibility = "visible";
                               email.classList.remove("error");
                            }

                            email.onblur = function() {
                                emailSpan.style.visibility = "hidden";
                            }



                            //setting content for password
                            var pwdSpan  = document.createElement("span");
                            pwdSpan.style.visibility = "hidden";

                            var password = document.getElementById("password");
                            password.parentNode.appendChild(pwdSpan);
                            password.onfocus = function() {
                               pwdSpan.innerHTML = "Enter at least six characters, one uppercase letter, one number and one special character(!,@,#,$,%,^,&,*,+)";
                               pwdSpan.style.visibility = "visible";
                               password.classList.remove("error");
                            }

                            password.onblur = function() {
                               pwdSpan.style.visibility = "hidden";
                            }

                            //setting content for username
                            var userSpan  = document.createElement("span");
                            userSpan.style.visibility = "hidden";
                            

                            var username = document.getElementById("username");
                            username.parentNode.appendChild(userSpan);
                            username.onfocus = function() {
                               userSpan.innerHTML = "Usernamee should be like xyz";
                               userSpan.style.visibility = "visible";
                               username.classList.remove("error");
                            }

                            username.onblur = function() {
                                userSpan.style.visibility = "hidden";
                            }


                                  
                            var form = document.getElementById("signup-form");
                            form.onsubmit = function(e){

                                if (!(emailregex.test(email.value))){
                                    email.classList.add("error")
                                    emailSpan.style.visibility = "visible";
                                    emailSpan.innerHTML = "Invalid Email. Please follow the format prefix@domain_part1.domain_part2 (alphanumeric)";
                                    e.preventDefault();
            
                                }

                                if(!pwdregex.test(document.getElementById("password").value)){
                                    document.getElementById("password").classList.add("error");
                                    pwdSpan.innerHTML="The password field should contain at least six characters, one uppercase letter, one number and one special character (!,@,#,$,%,^,&,*,+).";
                                    pwdSpan.style.display = "block";  
                                    e.preventDefault();

                                }
                                
                            var username = document.getElementById('username').value;
                            alert(sample);
                            }



                        }


                      
                
                    
                },
                error: function(data){alert("error")},
            });
        }
    });
