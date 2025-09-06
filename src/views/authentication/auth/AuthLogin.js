import React, { useState } from 'react';
import {
    Box,
    Typography,
    FormGroup,
    FormControlLabel,
    Button,
    Stack,
    Checkbox,
    Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const AuthLogin = ({ title, subtitle, subtext, setIsAuthenticated }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setEmailError('');
        setPasswordError('');
        setSuccess(false);

        let valid = true;

        if (!email) {
            setEmailError('Email cannot be empty');
            valid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Invalid email format');
            valid = false;
        }

        if (!password) {
            setPasswordError('Password cannot be empty');
            valid = false;
        }

        if (!valid) return;

        setMessage('Login successful!');
        setSuccess(true);
        if (setIsAuthenticated) setIsAuthenticated(true);
        setTimeout(() => {
            navigate('/dashboard');
        }, 1200);
    };

    return (
        <>
            {title ? (
                <Typography fontWeight="700" variant="h2" mb={1}>
                    {title}
                </Typography>
            ) : null}

            {subtext}

            <form onSubmit={handleSubmit}>
                <Stack>
                    <Box>
                        <Typography variant="subtitle1"
                            fontWeight={600} component="label" htmlFor='email' mb="5px">Email</Typography>
                        <CustomTextField
                            id="email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            error={!!emailError}
                            helperText={emailError}
                        />
                    </Box>
                    <Box mt="25px">
                        <Typography variant="subtitle1"
                            fontWeight={600} component="label" htmlFor='password' mb="5px" >Password</Typography>
                        <CustomTextField
                            id="password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            error={!!passwordError}
                            helperText={passwordError}
                        />
                    </Box>
                    <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
                        <FormGroup>
                            <FormControlLabel
                                control={<Checkbox defaultChecked />}
                                label="Remember this Device"
                            />
                        </FormGroup>
                        <Typography
                            component={Link}
                            to="/"
                            fontWeight="500"
                            sx={{
                                textDecoration: 'none',
                                color: 'primary.main',
                            }}
                        >
                            Forgot Password ?
                        </Typography>
                    </Stack>
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            ✔️ {message}
                        </Alert>
                    )}
                    <Box>
                        <Button
                            color="primary"
                            variant="contained"
                            size="large"
                            fullWidth
                            type="submit"
                        >
                            Sign In
                        </Button>
                    </Box>
                </Stack>
            </form>
            {subtitle}
        </>
    );
};

export default AuthLogin;