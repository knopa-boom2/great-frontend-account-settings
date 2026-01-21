import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

import { useDebounce } from '../../hooks/useDebounce.ts';
import avatarImage from '../../img/avatar.jpg';
import {
  AccountData,
  getAccount,
  isUsernameUnique,
  updateAccount,
  updateAvatar,
} from '../../service/account-service.ts';
import { ToasterMessage } from '../index.ts';

import './styles/AccountForm.css';

export const AccountForm = () => {
  const [accountData, setAccountData] = useState<AccountData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    avatarUrl: null,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'firstName' | 'lastName' | 'email' | 'username', string>>
  >({});

  const [isUnique, setIsUnique] = useState<boolean>(true);
  const debouncedUsername = useDebounce(accountData.username, 400);

  const validateImage = (file: File) =>
    new Promise<void>((resolve, reject) => {
      const allowedTypes = ['image/png', 'image/jpeg'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('Only PNG and JPG uploads are allowed.'));
        return;
      }

      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (image.width < 800 || image.height < 800) {
          reject(new Error('Image must be at least 800x800 px.'));
          return;
        }
        resolve();
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Invalid image file.'));
      };

      image.src = objectUrl;
    });

  useEffect(() => {
    const getAccountData = async () => {
      try {
        const data = await getAccount();
        setAccountData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          username: data.username,
          avatarUrl: data.avatarUrl,
        });
      } catch (error) {
        console.error('Failed to load account data:', error);
      }
    };

    getAccountData();
  }, []);

  useEffect(() => {
    if (!debouncedUsername.trim()) {
      setIsUnique(false);
      return;
    }

    const checkUsername = async () => {
      try {
        const unique = await isUsernameUnique(debouncedUsername);
        setIsUnique(unique);
      } catch (error) {
        setIsUnique(false);
        console.error('Failed to update username data', error);
      }
    };

    checkUsername();
  }, [debouncedUsername]);

  const handleUploadImg = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const files = event.target.files;

    if (files && files.length > 0) {
      try {
        await validateImage(files[0]);
        const res = await updateAvatar(files[0]);
        if (res) {
          setAccountData((prev) => ({
            ...prev,
            avatarUrl: res.avatarUrl,
          }));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update avatar data';

        toast.error(
          () => (
            <ToasterMessage
              data={{
                title: 'Error',
                text: errorMessage,
                isSuccess: false,
              }}
            />
          ),
          {
            position: 'bottom-center',
            autoClose: 3000,
            hideProgressBar: true,
          }
        );
      }
    }
  };

  const handleNameUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedName = event.target.value;
    setAccountData((prev) => ({
      ...prev,
      firstName: updatedName,
    }));
    setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
  };

  const handleLastNameUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedLastName = event.target.value;
    setAccountData((prev) => ({
      ...prev,
      lastName: updatedLastName,
    }));
    setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
  };

  const handleEmailUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedEmail = event.target.value;
    setAccountData((prev) => ({
      ...prev,
      email: updatedEmail,
    }));
    setFieldErrors((prev) => ({ ...prev, email: undefined }));
  };

  const handleUsernameUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedUsername = event.target.value;
    setAccountData((prev) => ({
      ...prev,
      username: updatedUsername,
    }));
    setFieldErrors((prev) => ({ ...prev, username: undefined }));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Partial<
      Record<'firstName' | 'lastName' | 'email' | 'username', string>
    > = {};
    const alphanumericPattern = /^[a-zA-Z0-9]+$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernamePattern = /^[a-zA-Z0-9]+$/;

    if (!alphanumericPattern.test(accountData.firstName.trim())) {
      nextErrors.firstName = 'Only alphanumeric format is supported';
    }
    if (!alphanumericPattern.test(accountData.lastName.trim())) {
      nextErrors.lastName = 'Only alphanumeric format is supported';
    }
    if (!emailPattern.test(accountData.email.trim())) {
      nextErrors.email = 'Valid email format is required';
    }
    if (!usernamePattern.test(accountData.username.trim()) || !isUnique) {
      nextErrors.username =
        'Alphanumeric without spaces and must be unique (case insensitive)';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    try {
      const updatedData = await updateAccount({
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        email: accountData.email,
        username: accountData.username,
      });

      if (updatedData) {
        setAccountData((prev) => ({
          ...prev,
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          email: updatedData.email,
          username: updatedData.username,
        }));

        toast.success(
          () => (
            <ToasterMessage
              data={{
                title: 'Success',
                text: 'Changes saved successfully',
                isSuccess: true,
              }}
            />
          ),
          {
            position: 'bottom-center',
            autoClose: 3000,
            hideProgressBar: true,
          }
        );
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unexpected error. Please try again later or contact support.';

      toast.error(
        () => (
          <ToasterMessage
            data={{
              title: 'Error',
              text: errorMessage,
              isSuccess: false,
            }}
          />
        ),
        {
          position: 'bottom-center',
          autoClose: 3000,
          hideProgressBar: true,
        }
      );
    }
  };

  return (
    <div className='account-form'>
      <form onSubmit={handleFormSubmit}>
        <div className='form-avatar'>
          <img
            src={accountData.avatarUrl ?? avatarImage}
            alt='Profile avatar'
          />
          <div className='change-avatar'>
            <div className='file-input'>
              <input
                type='file'
                id='imageUpload'
                name='image'
                accept='.png, .jpg'
                onChange={handleUploadImg}
              />
              <label htmlFor='imageUpload' className='file-input__button'>
                Change avatar
              </label>
            </div>
            <span className='helper-text'>
              At least 800x800 px. JPG or PNG only.
            </span>
          </div>
        </div>
        <div className='form-fields'>
          <div className='form-fields__items'>
            <div className='form-fields__item'>
              <label htmlFor='name'>First name</label>
              <input
                id='name'
                type='text'
                placeholder='John'
                required
                value={accountData.firstName}
                onChange={handleNameUpdate}
              />
              {fieldErrors.firstName && (
                <span className='form-error'>{fieldErrors.firstName}</span>
              )}
            </div>
            <div className='form-fields__item'>
              <label htmlFor='lastName'>Last name</label>
              <input
                id='lastName'
                type='text'
                placeholder='Appleseed'
                required
                value={accountData.lastName}
                onChange={handleLastNameUpdate}
              />
              {fieldErrors.lastName && (
                <span className='form-error'>{fieldErrors.lastName}</span>
              )}
            </div>
          </div>
          <div className='form-fields__items'>
            <div className='form-fields__item'>
              <label htmlFor='email'>Email</label>
              <input
                autoComplete='email'
                id='email'
                type='email'
                placeholder='example@mail.com'
                required
                value={accountData.email}
                onChange={handleEmailUpdate}
              />
              {fieldErrors.email && (
                <span className='form-error'>{fieldErrors.email}</span>
              )}
            </div>
          </div>
          <div className='form-fields__items'>
            <div
              className={`form-fields__item form-fields__item--username username-${isUnique ? 'valid' : 'invalid'}`}
            >
              <label htmlFor='username'>Username</label>
              <input
                autoComplete='username'
                id='username'
                type='text'
                placeholder='johnappleseed'
                required
                value={accountData.username}
                onChange={handleUsernameUpdate}
              />
              {fieldErrors.username && (
                <span className='form-error'>{fieldErrors.username}</span>
              )}
              <span className='form-text'>
                Allows others to find and interact with you easily.
              </span>
            </div>
          </div>
        </div>
        <button type='submit' className='form-button'>
          Save changes
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};
