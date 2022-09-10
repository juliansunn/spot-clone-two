import { IconButton, Tooltip } from '@chakra-ui/react'
// import { GiRayGun } from 'react-icons/gi'

// import { brandRing } from '../../utils/brandRing'

export const PlayerControl = ({ label, icon, color, click, thumb, size }) => {
    return (
        <Tooltip label={label} placement="top">
            <IconButton
                onClick={click}
                transition="ease-out"
                transitionProperty="background"
                transitionDuration="normal"
                _hover={{
                    background: thumb ? '' : 'gray.light',
                }}
                size={size ? size : 'md'}
                aria-label={label}
                icon={icon}
                rounded="full"
                color={color}
            // {...brandRing}
            />
        </Tooltip>
    )
}