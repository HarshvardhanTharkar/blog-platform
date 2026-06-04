import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const updated = await userService.updateProfile(form);
      updateUser(updated);
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('Passwords do not match');
      return;
    }
    setChangingPw(true);
    setPwError('');
    setPwSuccess('');
    try {
      await userService.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-lg">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span>{user?.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>
        <div>
          <h1>{user?.name}</h1>
          <p className="profile-email">{user?.email}</p>
        </div>
      </div>

      <div className="profile-sections">
        {/* Edit Profile */}
        <section className="profile-section">
          <h2>Edit Profile</h2>
          {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
          {successMsg && <div className="alert alert-success"><span>✓</span> {successMsg}</div>}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                className="form-input"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                className="form-textarea"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                maxLength={300}
                placeholder="Tell readers about yourself..."
              />
              <small className="form-hint">{form.bio.length}/300</small>
            </div>
            <div className="form-group">
              <label>Avatar URL</label>
              <input
                name="avatar"
                type="url"
                className="form-input"
                value={form.avatar}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner spinner-sm" /> : 'Save Profile'}
            </button>
          </form>
        </section>

        {/* Change Password */}
        <section className="profile-section">
          <h2>Change Password</h2>
          {pwError && <div className="alert alert-error"><span>⚠</span> {pwError}</div>}
          {pwSuccess && <div className="alert alert-success"><span>✓</span> {pwSuccess}</div>}

          <form onSubmit={handlePwSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                className="form-input"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-input"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={changingPw}>
              {changingPw ? <span className="spinner spinner-sm" /> : 'Change Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;
