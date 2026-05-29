import React, { useEffect, useState } from 'react';

const defaultProfile = {
  householdName: 'My Household',
  householdSize: 1,
  preparednessGoalDays: 14,
};

function normalizeProfile(profile) {
  return {
    householdName: profile?.householdName ?? defaultProfile.householdName,
    householdSize: Number(profile?.householdSize) || defaultProfile.householdSize,
    preparednessGoalDays:
      Number(profile?.preparednessGoalDays) || defaultProfile.preparednessGoalDays,
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

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return `${label} must be a positive number.`;
  }

  return '';
}

export default function HouseholdProfile({ storageKey }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [form, setForm] = useState(getInitialForm(defaultProfile));
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSetupPromptDismissed, setIsSetupPromptDismissed] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    try {
      // TODO: Replace this temporary localStorage fallback with GET /profile once the backend route exists.
      const savedProfile = window.localStorage.getItem(storageKey);

      if (!savedProfile) {
        setProfile(defaultProfile);
        setForm(getInitialForm(defaultProfile));
        setHasSavedProfile(false);
        return;
      }

      const parsedProfile = normalizeProfile(JSON.parse(savedProfile));
      setProfile(parsedProfile);
      setForm(getInitialForm(parsedProfile));
      setHasSavedProfile(true);
    } catch (error) {
      console.error('Failed to load household profile:', error);
      setProfile(defaultProfile);
      setForm(getInitialForm(defaultProfile));
      setHasSavedProfile(false);
      setMessage({
        type: 'error',
        text: 'Unable to load your saved household profile on this device.',
      });
    }
  }, [storageKey]);

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

  const handleSave = (event) => {
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

    try {
      // TODO: Replace this temporary localStorage fallback with PUT /profile once the backend route exists.
      window.localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
      setProfile(normalizeProfile(updatedProfile));
      setForm(getInitialForm(updatedProfile));
      setHasSavedProfile(true);
      setIsSetupPromptDismissed(false);
      setIsEditing(false);
      setMessage({
        type: 'success',
        text: 'Household profile saved on this device.',
      });
    } catch (error) {
      console.error('Failed to save household profile:', error);
      setMessage({
        type: 'error',
        text: 'Unable to save your household profile on this device. Please try again.',
      });
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
            Keep key planning details close to your inventory dashboard.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="secondary-button profile-edit-button"
            onClick={handleStartEdit}
          >
            Edit
          </button>
        )}
      </div>

      {!hasSavedProfile && !isSetupPromptDismissed && !isEditing && (
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
              />
            </div>
          </div>

          <div className="profile-form-actions">
            <button type="submit" className="primary-button">
              Save
            </button>
            <button type="button" className="ghost-button" onClick={handleCancel}>
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
        Profile data is temporarily saved locally until the planned authenticated profile API is available.
      </p>
    </section>
  );
}
