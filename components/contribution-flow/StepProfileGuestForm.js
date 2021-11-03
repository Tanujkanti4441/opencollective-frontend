import React from 'react';
import PropTypes from 'prop-types';
import { set } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { isEmail } from 'validator';

import Captcha, { isCaptchaEnabled } from '../Captcha';
import Container from '../Container';
import { Flex } from '../Grid';
import I18nFormatters, { getI18nLink } from '../I18nFormatters';
import Link from '../Link';
import StyledInput from '../StyledInput';
import StyledInputField from '../StyledInputField';
import StyledInputLocation from '../StyledInputLocation';
import { P } from '../Text';

import StepProfileInfoMessage from './StepProfileInfoMessage';
import { getTotalAmount } from './utils';

const shouldRequireAllInfo = amount => {
  return Boolean(amount && amount >= 500000);
};

export const validateGuestProfile = (stepProfile, stepDetails, showError) => {
  if (shouldRequireAllInfo(getTotalAmount(stepDetails))) {
    const { location, name } = stepProfile;
    if (!name || !location.country || !(location.address || location.structured)) {
      return false;
    }
  }

  if (isCaptchaEnabled() && !stepProfile.captcha) {
    showError('Captcha is required.');
    return false;
  }

  if (!stepProfile.email || !isEmail(stepProfile.email)) {
    return false;
  } else {
    return true;
  }
};

const getSignInLinkQueryParams = email => {
  const params = { next: typeof window !== undefined ? window.location.pathname : '' };
  return email ? { ...params, email } : params;
};

const StepProfileGuestForm = ({ stepDetails, onChange, data, defaultEmail, defaultName, isEmbed, onSignInClick }) => {
  const totalAmount = getTotalAmount(stepDetails);
  const dispatchChange = (field, value) => onChange({ stepProfile: set({ ...data, isGuest: true }, field, value) });
  const dispatchGenericEvent = e => dispatchChange(e.target.name, e.target.value);

  React.useEffect(() => {
    if (!data) {
      if (defaultName) {
        dispatchChange('name', defaultName);
      }
      if (defaultEmail) {
        dispatchChange('email', defaultEmail);
      }
    }
  }, [defaultEmail, defaultName]);

  return (
    <Container border="none" width={1} pb={3}>
      <StyledInputField
        htmlFor="email"
        label={<FormattedMessage defaultMessage="Your email" />}
        labelFontSize="16px"
        labelFontWeight="700"
        maxLength="254"
        required
        hint={
          !isEmbed && (
            <FormattedMessage
              defaultMessage="If you already have an account or want to contribute as an organization, <SignInLink>Sign in</SignInLink>."
              values={{
                SignInLink: getI18nLink({
                  as: Link,
                  href: { pathname: '/signin', query: getSignInLinkQueryParams(data?.email) },
                  'data-cy': 'cf-profile-signin-btn',
                  onClick: e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSignInClick();
                  },
                }),
              }}
            />
          )
        }
      >
        {inputProps => (
          <StyledInput
            {...inputProps}
            value={data?.email || ''}
            placeholder="tanderson@thematrix.com"
            type="email"
            onChange={dispatchGenericEvent}
          />
        )}
      </StyledInputField>
      <P fontSize="13px" mt="6px" color="black.700"></P>
      <StyledInputField
        htmlFor="name"
        label={<FormattedMessage id="Fields.displayName" defaultMessage="Display name" />}
        labelFontSize="16px"
        labelFontWeight="700"
        required={totalAmount >= 25000 && !data?.legalName}
        mt={52}
        hint={
          <FormattedMessage defaultMessage="This is your display name or alias. Leave it in blank to appear as guest." />
        }
      >
        {inputProps => (
          <StyledInput
            {...inputProps}
            value={data?.name || ''}
            placeholder="Neo"
            onChange={dispatchGenericEvent}
            maxLength="255"
          />
        )}
      </StyledInputField>
      <StyledInputField
        htmlFor="legalName"
        label={<FormattedMessage defaultMessage="Legal name" />}
        labelFontSize="16px"
        labelFontWeight="700"
        isPrivate
        required={totalAmount >= 25000 && !data?.name}
        mt={20}
        hint={
          <FormattedMessage defaultMessage="If different from your display name. Not public. Important for receipts, invoices, payments, and official documentation." />
        }
      >
        {inputProps => (
          <StyledInput
            {...inputProps}
            value={data?.legalName || ''}
            placeholder="Thomas A. Anderson"
            onChange={dispatchGenericEvent}
            maxLength="255"
          />
        )}
      </StyledInputField>
      {shouldRequireAllInfo(totalAmount) && (
        <React.Fragment>
          <hr />
          <StyledInputLocation
            autoDetectCountry
            location={data?.location}
            onChange={value => dispatchChange('location', value)}
            labelFontSize="16px"
            labelFontWeight="700"
          />
        </React.Fragment>
      )}
      <StepProfileInfoMessage amount={totalAmount} interval={stepDetails.interval} />
      {isCaptchaEnabled() && (
        <Flex justifyContent="center">
          <Captcha onVerify={result => dispatchChange('captcha', result)} />
        </Flex>
      )}
      <P color="black.500" fontSize="12px" mt={isCaptchaEnabled() ? 3 : 4} data-cy="join-conditions">
        <FormattedMessage
          id="SignIn.legal"
          defaultMessage="By joining, you agree to our <TOSLink>Terms of Service</TOSLink> and <PrivacyPolicyLink>Privacy Policy</PrivacyPolicyLink>."
          values={I18nFormatters}
        />
      </P>
    </Container>
  );
};

StepProfileGuestForm.propTypes = {
  stepDetails: PropTypes.shape({
    amount: PropTypes.number,
    interval: PropTypes.string,
  }).isRequired,
  data: PropTypes.object,
  onSignInClick: PropTypes.func,
  onChange: PropTypes.func,
  defaultEmail: PropTypes.string,
  defaultName: PropTypes.string,
  isEmbed: PropTypes.bool,
};

export default StepProfileGuestForm;
