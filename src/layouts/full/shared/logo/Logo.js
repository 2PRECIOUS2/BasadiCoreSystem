import { Link } from "react-router-dom";
import { styled, Box, Typography } from "@mui/material";
import LogoImg from "src/assets/images/logos/LOGO.png"; // Use the PNG for image import

const LinkStyled = styled(Link)(() => ({
  display: "flex",
  alignItems: "center",
  height: 70,
  textDecoration: "none"
}));

const Logo = () => {
  return (
    <LinkStyled to="/">
      <Box
        component="img"
        src={LogoImg}
        alt="BasadiCore Logo"
        sx={{
          height: 48,
          width: 48,
          mr: 2,
          borderRadius: 2,
          boxShadow: 1,
          background: "#fff"
        }}
      />
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#1565c0",
          letterSpacing: 1,
        }}
      >
        BasadiCore
      </Typography>
    </LinkStyled>
  );
};

export default Logo;