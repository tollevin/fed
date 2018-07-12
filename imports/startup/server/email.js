import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.startup(function () {
  smtp = {
    username: 'postmaster@mg.getfednyc.com', // eg: server@gentlenode.com
    password: '8336f45b7a0d32864255c4622040e419', // eg: 3eeP1gtizk5eziohfervU
    server: 'smtp.mailgun.org', // eg: mail.gandi.net
    port: 587,
  };
  process.env.ROOT_URL = 'https://getfednyc.com';
  process.env.MAIL_URL = `smtp://${encodeURIComponent(smtp.username)}:${encodeURIComponent(smtp.password)}@${encodeURIComponent(smtp.server)}:${smtp.port}`;

  Meteor.absoluteUrl.defaultOptions.rootUrl = 'https://getfednyc.com';

  // Configures "reset password account" email link
  Accounts.urls.resetPassword = function(token) {
    return Meteor.absoluteUrl(`reset-password/${token}`);
  };

  // Configures "enroll account" email link
  Accounts.urls.enrollAccount = function(token) {
    return Meteor.absoluteUrl(`enroll-account/${token}`);
  };

  // Configures "verify email" email link
  Accounts.urls.verifyEmail = function(token) {
    return Meteor.absoluteUrl(`verify-email/${token}`);
  };
});


Accounts.emailTemplates.siteName = 'GetFedNYC.com';
Accounts.emailTemplates.from = 'Fed <no-reply@getfednyc.com>';

Accounts.emailTemplates.enrollAccount = {
  subject() {
    return 'Welcome to GetFedNYC';
  },
  text(user, url) {
    return `Hey, {user}!


Thank you for choosing GetFedNYC, Brooklyn’s best blend of convenience, sustainability, and quality nutrition!


Here's how we work:
Create an account : DONE! 
Select your first pack
Enjoy our weekly menu of freshly made, never frozen meals made with local ingredients!


Never worry about meal prep, or kitchen clean up again!


Want to customize your box or skip this week’s order? Be sure to let us know by Wednesday!  After Wednesday your order will be processed and shipped freshly and conveniently to your door.  


Check out this week’s menu and see how we arrange our packages to pick which one is right for you! <LINK TO MENU>
You will be receiving emails every week as the new menus go up, when you have one day remaining to customize or cancel for the week, and when your delivery is on its way.
We want to thank you again for your business and we look forward to delivering to your door soon! 


The GetFedNYC Team
`;
  },
};

Accounts.emailTemplates.resetPassword = {
  subject() {
    return 'Reset your password at GetFedNYC.com';
  },
  text(user, url) {
    return `Hello!

Click the link below to reset your password at GetFedNYC.com:

${url}

If you didn't request this email, then nevermind!

Thanks,
The Fed team
`;
  },
};

Accounts.emailTemplates.verifyEmail = {
  subject() {
    return 'Welcome to Fed! Please verify your email';
  },
  html(user, url) {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8"> <!-- utf-8 works for most cases -->
  <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
    <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
  <title>Let's make it official. Verify your email to get started.</title> <!-- The title tag shows in email notifications, like Android 4.4. -->

  <!-- Web Font / @font-face : BEGIN -->
  <!-- NOTE: If web fonts are not required, lines 9 - 26 can be safely removed. -->
  
  <!-- Desktop Outlook chokes on web font references and defaults to Times New Roman, so we force a safe fallback font. -->
  <!--[if mso]>
    <style>
      * {
        // font-family: sans-serif !important;
      }
    </style>
  <![endif]-->
  
  <!-- All other clients get the webfont reference; some will render the font and others will silently fail to the fallbacks. More on that here: http://stylecampaign.com/blog/2015/02/webfont-support-in-email/ -->
  <!--[if !mso]><!-->
    <!-- insert web font reference, eg: <link href='https://fonts.googleapis.com/css?family=Roboto:400,700' rel='stylesheet' type='text/css'> -->
  <!--<![endif]-->

  <!-- Web Font / @font-face : END -->
  
  <!-- CSS Reset -->
    <style>

    /* What it does: Remove spaces around the email design added by some email clients. */
    /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
        html,
        body {
          margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
        }
        
        /* What it does: Stops email clients resizing small text. */
        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }
        
        /* What is does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
            margin:0 !important;
        }
        
        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }
                
        /* What it does: Fixes webkit padding issue. Fix for Yahoo mail table alignment bug. Applies table-layout to the first 2 tables then removes for anything nested deeper. */
        table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
        }
        table table table {
            table-layout: auto; 
        }
        
        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
            -ms-interpolation-mode:bicubic;
        }
        
        /* What it does: A work-around for iOS meddling in triggered links. */
        .mobile-link--footer a,
        a[x-apple-data-detectors] {
            color:inherit !important;
            text-decoration: underline !important;
        }

        /* What it does: Prevents underlining the button text in Windows 10 */
        .button-link {
            text-decoration: none !important;
        }

        .stack-column,
        .stack-column-center {
            display: inline-block !important;
        }      
    </style>
    
    <!-- Progressive Enhancements -->
    <style>
        
        /* What it does: Hover styles for buttons */
        .button-td,
        .button-a {
            transition: all 100ms ease-in;
        }
        .button-td:hover,
        .button-a:hover {
            background: #366833 !important;
            border-color: #366833 !important;
        }

        /* Media Queries */
        @media screen and (max-width: 600px) {

            .email-container {
                width: 100% !important;
                margin: auto !important;
            }

            /* What it does: Forces elements to resize to the full width of their container. Useful for resizing images beyond their max-width. */
            .fluid {
                max-width: 100% !important;
                height: auto !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }

            /* What it does: Forces table cells into full-width rows. */
            .stack-column,
            .stack-column-center {
                width: 50% !important;
                max-width: 100% !important;
                direction: ltr !important;
            }
            /* And center justify these ones. */
            .stack-column-center {
                text-align: center !important;
            }
            .pack-column {
                width: 100% !important;
                max-width: 100% !important;
                direction: ltr !important;
            }
            /* What it does: Generic utility class for centering. Useful for images, buttons, and nested tables. */
            .center-on-narrow {
                text-align: center !important;
                display: block !important;
                margin-left: auto !important;
                margin-right: auto !important;
                float: none !important;
            }
            table.center-on-narrow {
                display: inline-block !important;
            }
                
        }

    </style>

</head>
<body bgcolor="#eeeeee" width="100%" style="margin: 0;">
  <center style="width: 100%; background: #e4ffe1;">

    <!-- Visually Hidden Preheader Text : BEGIN -->
    <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;// font-family: sans-serif;">
      Easy, delicious meals are just a few clicks away!
    </div>
    <!-- Visually Hidden Preheader Text : END -->

    <!-- Email Header : BEGIN 
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin: auto;" class="email-container">
  <tr>
    <td style="padding: 20px 0; text-align: center">
      <img src="http://placehold.it/200x50" width="200" height="50" alt="alt_text" border="0" style="height: auto; background: #dddddd; // font-family: sans-serif; font-size: 15px; mso-height-rule: exactly; line-height: 20px; color: #555555;">
    </td>
  </tr>
    </table>
    Email Header : END -->
    
    <!-- Email Body : BEGIN -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin: auto;" class="email-container">
        
      <!-- Hero Image, Flush : BEGIN -->
      <tr>
        <td style="text-align: center; background-color: #ffffff;">
          <img src="https://getfednyc.com/images/welcome_header.jpg" width="600" height="200" alt="alt_text" border="0" align="center" class="fluid" style="width: 97%; max-width: 590px; height: auto; margin: 5px 5px; background: #dddddd; // font-family: sans-serif; font-size: 15px; mso-height-rule: exactly; line-height: 20px; color: #555555;">
        </td>
      </tr>
      <!-- Hero Image, Flush : END -->

      <!-- 1 Column Text : BEGIN -->
        <tr>
          <td bgcolor="#ffffff" style="padding: 40px; text-align: left; // font-family: sans-serif; font-size: 15px; mso-height-rule: exactly; line-height: 20px; color: #555555;">
            Hi there,
            <br><br>
            Thank you for choosing Fed, New York’s best blend of convenience, sustainability, and quality.
            <br><br>
            Visit this link to verify your email:
            <br><br>
            ${url}
            <br><br><br>
            <!-- Button : Begin -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto">
              <tr>
                <td style="border-radius: 3px; background: #99cc99; text-align: center;" class="button-td">
                  <a href="${url}" style="background: #99cc99; border: 15px solid #99cc99; // font-family: sans-serif; font-size: 13px; line-height: 1.1; text-align: center; text-decoration: none; text-align: center; display: block; border-radius: 3px; font-weight: bold;" class="button-a">
                    &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ffffff;">Verify your email</span>&nbsp;&nbsp;&nbsp;&nbsp;
                  </a>
                </td>
              </tr>
            </table>
            <!-- Button : END --> 
            <!-- 1 Column Text : BEGIN -->
              <br><br>
              If you've received this email in error, please go on enjoying your day.
              <br><br>
              Sincerely,
              <br>
              The Fed Team
            <!-- 1 Column Text: END -->
          </td>
        </tr>
      </table>
      <!-- Email Body : END -->
                  
      <!-- Email Footer : BEGIN -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="margin: auto;" class="email-container">
        <tr>
          <td style="padding: 0px 10px 40px;width: 100%;font-size: 12px; // font-family: sans-serif; mso-height-rule: exactly; line-height:18px; text-align: center; color: #888888;">
            <br><br>
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width: 650px; margin:0 auto" width="100%">
              <tbody>
                <tr>
                  <td align="center" style="text-align: center; padding: 0px;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width: 650px; margin:0 auto" width="100%">
                      <tbody>
                        <tr>
                          <td align="center" style="text-align: center; padding-top: 20px; padding-bottom: 10px;"><!--[if gte mso 9]>
                            <table cellspacing="0" cellpadding="0" align="center">
                              <tr>
                                <td>
                          <![endif]-->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width: 43px; display: inline-block;" width="100%">
                              <tbody>
                                <tr>
                                  <td align="center" style="text-align: center; padding: 0px; padding-left: 5px; padding-right: 5px; display: inline-block;"><a href="https://twitter.com/getfednyc"><img align="center" alt="Twitter" height="33" src="https://getfednyc.com/icons/social/twitter.png" style="display:block; border:0;" width="33" /> </a></td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if gte mso 9]>
                              </td>
                                <td>
                            <![endif]-->
                             <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width: 43px; display: inline-block;" width="100%">
                              <tbody>
                                <tr>
                                  <td align="center" style="text-align: center; padding: 0px; padding-left: 5px; padding-right: 5px; display: inline-block;"><a href="https://www.facebook.com/getfednyc"><img align="center" alt="Facebook" height="33" src="https://getfednyc.com/icons/social/fb.png" style="display:block; border:0;" width="33" /> </a></td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if gte mso 9]>
                              </td>
                              <td>
                            <![endif]-->
                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width: 43px; display: inline-block;" width="100%">
                              <tbody>
                                <tr>
                                  <td align="center" style="text-align: center; padding: 0px; padding-left: 5px; padding-right: 5px; display: inline-block;"><a href="https://www.instagram.com/getfednyc"><img align="center" alt="Instagram" height="33" src="https://getfednyc.com/icons/social/insta.png" style="display:block; border:0;" width="33" /> </a></td>
                                </tr>
                              </tbody>
                            </table>
                            <!--[if gte mso 9]>
                              </td>
                              <td>
                            <![endif]-->
                            <br>
                            #getfednyc
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Email Footer : END -->
            </tbody>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
  },
};

//   html(user, url) {
//     return `
//       XXX Generating HTML emails that work across different email clients is a very complicated
//       business that we're not going to solve in this particular example app.
//
//       A good starting point for making an HTML email could be this responsive email boilerplate:
//       https://github.com/leemunroe/responsive-html-email-template
//
//       Note that not all email clients support CSS, so you might need to use a tool to inline
//       all of your CSS into style attributes on the individual elements.
// `
//   }
