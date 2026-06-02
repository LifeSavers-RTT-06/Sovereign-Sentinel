import React, { useEffect, useState } from 'react';
import { AuthSessionNotReadyError, getProfile, updateProfile } from '../api/suppliesApi.js';

const defaultProfile = {
  householdName: 'My Household',
  householdSize: 1,
  preparednessGoalDays: 14,
};

function normalizeProfile(profile) {
  return {
    userId: profile?.userId,
    householdName: profile?.householdName ?? defaultProfile.householdName,
    householdSize: Number(profile?.householdSize) || defaultProfile.householdSize,
    preparednessGoalDays:
      Number(profile?.preparednessGoalDays) || defaultProfile.preparednessGoalDays,
    updatedAt: profile?.updatedAt,
  };
}

function getInitialForm(profile) {
  const normalizedProfile = normalizeProfile(profile);

  return {
    householdName: normalizedProfile.householdName,
    householdSize: String(normalizedProfile.householdSize),
    preparednessGoalDays: String(normalizedProfile.preparednessGoalDays),
  };
}

function validatePositiveNumber(value, label) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return `${label} must be a positive whole number.`;
  }

  return '';
}

function isProfileEmpty(profile) {
  if (!profile || Object.keys(profile).length === 0) {
    return true;
  }

  return !profile.householdName && !profile.householdSize && !profile.preparednessGoalDays;
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export default function HouseholdProfile({ authenticatedUserKey }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [form, setForm] = useState(getInitialForm(defaultProfile));
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSetupPromptDismissed, setIsSetupPromptDismissed] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let isCurrentLoad = true;

    const loadProfile = async () => {
      if (!authenticatedUserKey) {
        setProfile(defaultProfile);
        setForm(getInitialForm(defaultProfile));
        setHasSavedProfile(false);
        setIsLoadingProfile(true);
        return;
      }

      setIsLoadingProfile(true);
      setMessage({ type: '', text: '' });

      try {
        let savedProfile;

        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            savedProfile = await getProfile();
            break;
          } catch (error) {
            if (error instanceof AuthSessionNotReadyError && attempt === 0) {
              await delay(600);
              continue;
            }

            throw error;
          }
        }

        if (!isCurrentLoad) {
          return;
        }

        if (isProfileEmpty(savedProfile)) {
          setProfile(defaultProfile);
          setForm(getInitialForm(defaultProfile));
          setHasSavedProfile(false);
          setIsSetupPromptDismissed(false);
          setIsLoadingProfile(false);
          return;
        }

        const parsedProfile = normalizeProfile(savedProfile);
        setProfile(parsedProfile);
        setForm(getInitialForm(parsedProfile));
        setHasSavedProfile(true);
        setIsSetupPromptDismissed(false);
        setIsLoadingProfile(false);
      } catch (error) {
        if (!isCurrentLoad) {
          return;
        }

        console.error('Failed to load household profile:', error);
        setProfile(defaultProfile);
        setForm(getInitialForm(defaultProfile));
        setHasSavedProfile(false);
        setIsLoadingProfile(false);
        setMessage({
          type: 'error',
          text:
            error instanceof AuthSessionNotReadyError
              ? 'Finishing sign-in before loading your household profile…'
              : 'Unable to load your saved household profile right now. Defaults are shown until the profile API is available.',
        });
      }
    };

    loadProfile();

    return () => {
      isCurrentLoad = false;
    };
  }, [authenticatedUserKey]);

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleStartEdit = () => {
    setForm(getInitialForm(profile));
    setMessage({ type: '', text: '' });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(getInitialForm(profile));
    setMessage({ type: '', text: '' });
    setIsEditing(false);
  };

  const handleSkipSetup = () => {
    setIsSetupPromptDismissed(true);
    setMessage({
      type: 'success',
      text: 'No problem — you can set up your household profile whenever you are ready.',
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const householdSizeError = validatePositiveNumber(form.householdSize, 'Household size');
    const preparednessGoalError = validatePositiveNumber(
      form.preparednessGoalDays,
      'Preparedness goal',
    );

    if (householdSizeError || preparednessGoalError) {
      setMessage({ type: 'error', text: householdSizeError || preparednessGoalError });
      return;
    }

    const updatedProfile = {
      householdName: form.householdName.trim(),
      householdSize: Number(form.householdSize),
      preparednessGoalDays: Number(form.preparednessGoalDays),
    };

    setIsSavingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      const savedProfile = await updateProfile(updatedProfile);
      const normalizedSavedProfile = normalizeProfile(savedProfile ?? updatedProfile);
      setProfile(normalizedSavedProfile);
      setForm(getInitialForm(normalizedSavedProfile));
      setHasSavedProfile(true);
      setIsSetupPromptDismissed(false);
      setIsEditing(false);
      setMessage({
        type: 'success',
        text: 'Household profile saved and synced to your account.',
      });
    } catch (error) {
      console.error('Failed to save household profile:', error);
      setMessage({
        type: 'error',
        text: `Unable to save your household profile to your account: ${error.message}`,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const profileDetails = [
    {
      label: 'Household Name',
      value: profile.householdName?.trim() || 'Not set yet',
    },
    {
      label: 'Household Size',
      value: `${profile.householdSize} ${profile.householdSize === 1 ? 'person' : 'people'}`,
    },
    {
      label: 'Preparedness Goal',
      value: `${profile.preparednessGoalDays} days`,
    },
  ];

  return (
    <section id="profile" className="panel profile-panel" aria-labelledby="profile-heading">
      <div className="profile-header">
        <div>
          <p className="eyebrow">Household</p>
          <h2 id="profile-heading">Household Profile</h2>
          <p className="section-description profile-description">
            Keep key planning details synced to your authenticated account.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="secondary-button profile-edit-button"
            onClick={handleStartEdit}
            disabled={isLoadingProfile}
          >
            Edit
          </button>
        )}
      </div>

      {isLoadingProfile && <div className="loading-panel">Loading household profile…</div>}

      {!isLoadingProfile && !hasSavedProfile && !isSetupPromptDismissed && !isEditing && (
        <div className="setup-prompt" role="status">
          <div>
            <strong>Set up your household profile</strong>
            <p>Add your household details now, or skip and keep using the dashboard.</p>
          </div>
          <div className="setup-actions">
            <button type="button" className="secondary-button" onClick={handleStartEdit}>
              Set up
            </button>
            <button type="button" className="ghost-button" onClick={handleSkipSetup}>
              Skip for now
            </button>
          </div>
        </div>
      )}

      {message.text && (
        <div
          className={`profile-message ${
            message.type === 'error' ? 'profile-message-error' : 'profile-message-success'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {isEditing ? (
        <form className="profile-form" onSubmit={handleSave}>
          <div>
            <label htmlFor="household-name">Household Name</label>
            <input
              id="household-name"
              type="text"
              className="mobile-input"
              placeholder="My Household"
              value={form.householdName}
              onChange={(event) => updateField('householdName', event.target.value)}
              disabled={isSavingProfile}
            />
          </div>

          <div className="two-column-fields">
            <div>
              <label htmlFor="household-size">Household Size</label>
              <input
                id="household-size"
                type="number"
                min="1"
                step="1"
                className="mobile-input"
                value={form.householdSize}
                onChange={(event) => updateField('householdSize', event.target.value)}
                disabled={isSavingProfile}
              />
            </div>

            <div>
              <label htmlFor="preparedness-goal">Preparedness Goal</label>
              <input
                id="preparedness-goal"
                type="number"
                min="1"
                step="1"
                className="mobile-input"
                value={form.preparednessGoalDays}
                onChange={(event) => updateField('preparednessGoalDays', event.target.value)}
                disabled={isSavingProfile}
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <button type="submit" className="primary-button" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={handleCancel}
              disabled={isSavingProfile}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-grid">
          {profileDetails.map((detail) => (
            <article className="profile-card" key={detail.label}>
              <p>{detail.label}</p>
              <strong>{detail.value}</strong>
            </article>
          ))}
        </div>
      )}

      <p className="profile-storage-note">
        Profile data is saved to your authenticated cloud profile and follows this Cognito user across devices.
      </p>
    </section>
  );
}
