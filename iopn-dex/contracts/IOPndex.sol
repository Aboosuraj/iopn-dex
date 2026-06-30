// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract IOPnDex {

        string public name = "IOPn Dex Token";
            string public symbol = "IDEX";
                uint8 public decimals = 18;

                    uint256 public totalSupply = 10_000_000 * 10 ** 18;

                        address public owner;

                            mapping(address => uint256) public balanceOf;

                                event Transfer(address indexed from, address indexed to, uint256 value);

                                    modifier onlyOwner() {
                                                require(msg.sender == owner, "Not owner");
                                                        _;
                                    }

                                        constructor() {
                                                    owner = msg.sender;
                                                            balanceOf[msg.sender] = totalSupply;

                                                                    emit Transfer(address(0), msg.sender, totalSupply);
                                        }

                                            function transfer(address to, uint256 value) external returns (bool) {
                                                        require(balanceOf[msg.sender] >= value, "No balance");

                                                                balanceOf[msg.sender] -= value;
                                                                        balanceOf[to] += value;

                                                                                emit Transfer(msg.sender, to, value);
                                                                                        return true;
                                            }

                                                // 🔐 OWNER CHECK FUNCTION (IMPORTANT FOR YOUR DEX)
                                                    function isOwner(address user) external view returns (bool) {
                                                                return user == owner;
                                                    }
}
                                                    }
                                            }
                                        }
                                    }
}