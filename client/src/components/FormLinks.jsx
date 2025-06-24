import React from 'react';
import { Link } from 'react-router-dom';

const FormLinks = () => (
  <>
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          className="h-4 w-4 text-[#ff4d30] focus:ring-[#ff4d30] border-[#ffccb3] rounded"
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-black">
          Remember me
        </label>
      </div>

      <div className="text-sm">
        <Link
          to="/forgot-password"
          className="font-medium text-[#00bcd4] hover:text-[#00acc1] transition-colors"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
    <p className="mt-4 text-center text-sm text-black">
      Nouveau chez Yumzo ?{' '}
      <Link to="/register" className="text-[#00bcd4] font-medium hover:text-[#00acc1]">
        Créez un compte
      </Link>
    </p>
  </>
);

export default FormLinks;