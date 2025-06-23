let mockUser = {
  name: 'Admin',
  shopName: '',
  shopAddress: '',
  mobile: '',
  gst: '',
  email: '',
  image: ''
};

export const getUserProfile = () => {
  return Promise.resolve(mockUser);
};

export const updateUserProfile = (data) => {
  mockUser = { ...mockUser, ...data };
  return Promise.resolve(mockUser);
};
